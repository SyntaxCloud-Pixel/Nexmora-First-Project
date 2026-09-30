import * as React from "react"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md px-4 py-3 shadow-lg",
      colors[type]
    )}>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-white/20 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}