"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Agent } from "@/lib/features/agents/agentsSlice"
import type { VerifiableCredential } from "@/lib/features/credentials/credentialsSlice"

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  agentId: z.string().min(1, "Please select an agent"),
})

interface CredentialBasicInfoProps {
  credentialData: Partial<VerifiableCredential>
  updateCredentialData: (data: Partial<VerifiableCredential>) => void
  agents: Agent[]
}

export function CredentialBasicInfo({ credentialData, updateCredentialData, agents }: CredentialBasicInfoProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: credentialData.name || "",
      description: credentialData.description || "",
      agentId: credentialData.agentId || "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateCredentialData(values)
  }

  // Update parent state when form values change
  const handleFormChange = () => {
    const values = form.getValues()
    updateCredentialData(values)
  }

  return (
    <Form {...form}>
      <form onChange={handleFormChange} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credential Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Medical Assistant Access" {...field} />
              </FormControl>
              <FormDescription>A descriptive name for this credential</FormDescription>
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
                <Textarea
                  placeholder="Describe what this credential authorizes the agent to do..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Detailed description of the credential's purpose and scope</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Agent</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI agent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>The AI agent that will use this credential</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
