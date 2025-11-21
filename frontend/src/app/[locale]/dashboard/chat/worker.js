import { pipeline, TextStreamer, env } from "@huggingface/transformers";

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
    static task = 'text-generation';
    static model = 'onnx-community/granite-4.0-350m-ONNX-web';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { 
                device: 'webgpu',
                progress_callback 
            });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    try {
        // Handle preload request - just load the model without generating
        if (event.data.action === 'preload') {
            self.postMessage({ status: 'initiate' });
            // Retrieve the text generation pipeline. When called for the first time,
            // this will load the pipeline and save it for future use.
            let generator = await PipelineSingleton.getInstance(x => {
                // We also add a progress callback to the pipeline so that we can
                // track model loading.
                self.postMessage(x);
            });
            // Model is now loaded and ready
            self.postMessage({ status: 'ready' });
            return;
        }

        // Retrieve the text generation pipeline. When called for the first time,
        // this will load the pipeline and save it for future use.
        let generator = await PipelineSingleton.getInstance(x => {
            // We also add a progress callback to the pipeline so that we can
            // track model loading.
            self.postMessage(x);
        });

        // Prepare messages - support both array format and simple text
        let messages;
        if (event.data.messages && Array.isArray(event.data.messages)) {
            // Use provided messages array
            messages = event.data.messages;
        } else if (event.data.text) {
            // Convert simple text to message format
            messages = [
                { role: 'system', content: event.data.systemPrompt || 'You are a helpful assistant.' },
                { role: 'user', content: event.data.text }
            ];
        } else {
            throw new Error('Either messages array or text must be provided');
        }

        // Create a custom streamer that sends chunks to the main thread
        const streamedText = [];
        const streamer = new TextStreamer(generator.tokenizer, { 
            skip_prompt: true, 
            skip_special_tokens: true,
            callback_function: (text) => {
                streamedText.push(text);
                // Send streaming updates to main thread
                self.postMessage({
                    status: 'streaming',
                    chunk: text,
                    accumulated: streamedText.join('')
                });
            }
        });

        // Generate a response with optimized parameters
        const output = await generator(messages, {
            max_new_tokens: event.data.max_new_tokens || 256, // Default reduced for speed
            do_sample: event.data.do_sample !== undefined ? event.data.do_sample : false,
            temperature: event.data.temperature || 0.7,
            top_p: event.data.top_p || 0.9,
            repetition_penalty: event.data.repetition_penalty || 1.1,
            streamer: streamer,
        });

        // Extract the generated content
        const generatedContent = output[0]?.generated_text?.at(-1)?.content || 
                                 output[0]?.generated_text || 
                                 streamedText.join('');

        // Send the complete output back to the main thread
        self.postMessage({
            status: 'complete',
            output: generatedContent,
            fullOutput: output,
        });
    } catch (error) {
        // Send error back to main thread
        console.error('Worker error:', error);
        self.postMessage({
            status: 'error',
            error: error.message || String(error),
            stack: error.stack,
        });
    }
});
