interface ToastProps {
  message: string
}

export const Toast = ({ message }: ToastProps) => (
  <div className="fixed right-4 top-4 z-50 rounded-md border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-3 font-data text-sm text-accent-cyan shadow-lg">
    {message}
  </div>
)
