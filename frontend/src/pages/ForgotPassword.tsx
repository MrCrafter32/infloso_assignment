import { motion, type Easing, type Variants } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../validators/forgot-password.schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { forgotPassword } from '../services/auth.api'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'


export default function ForgotPassword() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const easeOut: Easing = [0.16, 1, 0.3, 1]

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
        when: 'beforeChildren',
        staggerChildren: 0.06,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
  }

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values.email)
      setSnackbar({
        open: true,
        message: 'Password reset link sent to your email',
        severity: 'success',
      })
      form.reset()
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to send reset link',
        severity: 'error',
      })
    }
  }

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-[#181818] p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Reset your password
        </h1>

        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your email address and we’ll send you a reset link.
        </p>

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="bg-[#121212] border-gray-700 text-white focus-visible:ring-[#1DB954]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
            </motion.div>
          </motion.form>
        </Form>

        <div className="mt-6 text-sm text-center text-gray-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-[#1DB954] hover:underline">
            Back to login
          </Link>
        </div>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
