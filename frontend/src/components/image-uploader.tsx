"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";

export default function ImageUploader() {
    const [images, setImages] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setImages((prevImages) => [...prevImages, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif"],
        },
        multiple: true,
    });

    const removeImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    return (
        <div className="mx-auto w-full max-w-md p-6">
            <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center ${
                    isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
                }`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the images here ...</p>
                ) : (
                    <p>Drag &apos;n&apos; drop some images here, or click to select files</p>
                )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                {images.map((file, index) => (
                    <div key={index} className="relative">
                        <Image
                            src={URL.createObjectURL(file)}
                            alt={`Uploaded image ${index + 1}`}
                            width={200}
                            height={200}
                            className="h-40 w-full rounded-lg object-cover"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(index)}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove image</span>
                        </Button>
                    </div>
                ))}
            </div>

            {images.length > 0 && (
                <Button
                    className="mt-4 w-full"
                    onClick={() => {
                        // Here you would typically handle the upload process
                        console.log("Uploading images:", images);
                    }}
                >
                    Upload {images.length} {images.length === 1 ? "image" : "images"}
                </Button>
            )}
        </div>
    );
}
