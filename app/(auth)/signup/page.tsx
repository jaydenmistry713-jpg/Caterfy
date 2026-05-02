import SignupForm from './signup-form'

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start your free trial</h1>
        <p className="text-gray-500">14 days free · No credit card required</p>
      </div>
      <SignupForm />
    </div>
  )
}
