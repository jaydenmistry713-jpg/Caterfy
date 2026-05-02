import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500">Log in to your Caterfy dashboard</p>
      </div>
      <LoginForm />
    </div>
  )
}
