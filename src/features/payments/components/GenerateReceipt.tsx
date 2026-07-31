import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { toast } from 'sonner'

export default function GenerateReceipt() {
  const [open, setOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('')
  const { payments, isLoading } = usePayments({ page: 0, size: 100 })

  // Filter only PAID payments
  const paidPayments = payments.filter(p => p.status === 'PAID')
  const selectedPayment = paidPayments.find(p => p.id === Number(selectedPaymentId))

  const handlePrint = () => {
    if (!selectedPayment) {
      toast.error('Please select a payment first')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to generate receipt')
      return
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${selectedPayment.receiptNumber}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 40px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1e40af;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #64748b;
              margin: 5px 0;
            }
            .receipt-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-box {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .info-box h3 {
              margin: 0 0 10px 0;
              color: #1e40af;
              font-size: 14px;
              text-transform: uppercase;
            }
            .info-box p {
              margin: 5px 0;
              color: #334155;
            }
            .amount-box {
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .amount-box h2 {
              margin: 0;
              font-size: 36px;
            }
            .amount-box p {
              margin: 5px 0;
              opacity: 0.9;
            }
            .status-badge {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 12px;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PG Manager</h1>
            <p>Payment Receipt</p>
          </div>

          <div class="receipt-info">
            <div class="info-box">
              <h3>Receipt Details</h3>
              <p><strong>Receipt No:</strong> ${selectedPayment.receiptNumber || 'N/A'}</p>
              <p><strong>Payment Date:</strong> ${new Date(selectedPayment.paymentDate).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Due Date:</strong> ${new Date(selectedPayment.dueDate).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>

            <div class="info-box">
              <h3>Tenant Information</h3>
              <p><strong>Name:</strong> ${selectedPayment.tenantName}</p>
              <p><strong>Room No:</strong> ${selectedPayment.roomNumber}</p>
              <p><strong>Payment Month:</strong> ${selectedPayment.paymentMonth || 'N/A'}</p>
            </div>
          </div>

          <div class="amount-box">
            <p>Total Amount</p>
            <h2>₹${selectedPayment.amount.toLocaleString('en-IN')}</h2>
            <div class="status-badge">PAID</div>
          </div>

          <div class="footer">
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
            <p>Thank you for your payment!</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <FileText className="w-4 h-4 mr-2" />
          Generate Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generate Payment Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Paid Payment</label>
            <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a payment..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading payments...
                  </SelectItem>
                ) : paidPayments.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No paid payments found
                  </SelectItem>
                ) : (
                  paidPayments.map((payment) => (
                    <SelectItem key={payment.id} value={String(payment.id)}>
                      {payment.tenantName} - Room {payment.roomNumber} - ₹{payment.amount.toLocaleString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-900">Receipt Preview</h4>
              <div className="text-sm space-y-1 text-blue-800">
                <p><strong>Tenant:</strong> {selectedPayment.tenantName}</p>
                <p><strong>Room:</strong> {selectedPayment.roomNumber}</p>
                <p><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString()}</p>
                <p><strong>Receipt No:</strong> {selectedPayment.receiptNumber || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handlePrint} 
            disabled={!selectedPayment}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
