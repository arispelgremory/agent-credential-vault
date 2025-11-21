"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
})

interface AgentBasicInfoProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentBasicInfo({ registrationData, updateRegistrationData }: AgentBasicInfoProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: registrationData.name || "",
      description: registrationData.description || "",
      purpose: registrationData.purpose || "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateRegistrationData(values)
  }

  // Update parent state when form values change
  const handleFormChange = () => {
    const values = form.getValues()
    updateRegistrationData(values)
  }

  return (
    <Form {...form}>
      <form onChange={handleFormChange} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Basic Agent Information</h3>
          <p className="text-muted-foreground">Provide basic information about the AI agent you're registering.</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Financial Assistant Bot" {...field} />
              </FormControl>
              <FormDescription>A descriptive name for this AI agent</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe what this agent does..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Detailed description of the agent's capabilities and functions</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain the purpose and intended use of this agent..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>The specific purpose and intended use cases for this agent</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
