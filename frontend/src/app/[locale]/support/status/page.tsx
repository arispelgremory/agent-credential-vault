import type { Metadata } from "next"
import { CheckCircle, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "System Status | MetaMynd",
  description: "Check the current status of MetaMynd's services and systems",
}

export default function StatusPage() {
  // This would typically be fetched from a status API
  const services = [
    { name: "Authentication Service", status: "operational", uptime: "99.99%" },
    { name: "Identity Management Service", status: "operational", uptime: "99.98%" },
    { name: "AI KYC Verification Service", status: "operational", uptime: "99.95%" },
    { name: "Verifiable Credentials Service", status: "operational", uptime: "99.97%" },
    { name: "Fraud Detection Service", status: "operational", uptime: "99.96%" },
    { name: "API Gateway", status: "operational", uptime: "99.99%" },
    { name: "Dashboard UI", status: "operational", uptime: "99.99%" },
  ]

  const incidents = [
    {
      title: "Scheduled Maintenance",
      date: "April 15, 2023",
      status: "scheduled",
      description:
        "We will be performing scheduled maintenance on our infrastructure. During this time, some services may experience brief interruptions.",
      time: "2:00 AM - 4:00 AM UTC",
    },
    {
      title: "API Gateway Performance Issue",
      date: "March 22, 2023",
      status: "resolved",
      description: "We experienced elevated latency in our API Gateway. The issue has been identified and resolved.",
      time: "Resolved at 15:45 UTC",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">System Status</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Current Status</h2>
          <div className="flex items-center text-green-500">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">All Systems Operational</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Service</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Uptime (30 days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((service, index) => (
                <tr key={index}>
                  <td className="py-3 px-4">{service.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="capitalize">{service.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{service.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Incidents</h2>

        {incidents.length === 0 ? (
          <p className="text-gray-600">No incidents reported in the last 30 days.</p>
        ) : (
          <div className="space-y-6">
            {incidents.map((incident, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-4 py-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{incident.title}</h3>
                  <div className="text-sm text-gray-500">{incident.date}</div>
                </div>
                <p className="text-gray-600 mb-2">{incident.description}</p>
                <div className="flex items-center text-sm">
                  {incident.status === "scheduled" ? (
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  )}
                  <span className="capitalize">{incident.status === "scheduled" ? incident.time : incident.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
