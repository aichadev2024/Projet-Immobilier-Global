'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import BrandMark from '@/components/vitrine/BrandMark'
import { API_BASE_URL, apiFetch } from '@/services/api'

export default function ValidateOTPPage() {
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [username, setUsername] = useState('')
  const [flowType, setFlowType] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const user = searchParams.get('username')
    const type = searchParams.get('type')
    if (user) setUsername(user)
    if (type) setFlowType(type)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpCode.trim() || otpCode.length < 6) {
      setMessage('Veuillez entrer le code à 6 chiffres')
      setIsSuccess(false)
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const data = await apiFetch("/auth/verify-otp", {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          code: otpCode.trim()
        })
      });

      setIsSuccess(true)
      setMessage(data.message || 'Validation réussie !')
      
      // Redirection vers login pour tous (pas de connexion auto)
      setTimeout(() => {
        router.push('/login?activated=true');
      }, 2000);
    } catch (error: any) {
      setIsSuccess(false)
      setMessage(error.message || 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!username) {
      setMessage('Identifiant non disponible')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const data = await apiFetch("/auth/otp/resend", {
        method: 'POST',
        body: JSON.stringify({
          username: username
        })
      });

      setIsSuccess(true)
      setMessage(data.message || 'Nouveau code envoyé ! Consultez vos SMS ou Emails.')
    } catch (error: any) {
      setIsSuccess(false)
      setMessage(error.message || 'Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/login" className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-bold text-sm tracking-tight mb-6 transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Link>
          <div className="flex justify-center mb-6">
             <BrandMark variant="light" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Vérification de sécurité</h1>
          <p className="text-slate-500 font-medium tracking-tight">
            {flowType === 'PENDING_2FA' ? 'Seconde étape de connexion' : 'Activation de votre compte'}
          </p>
        </div>

        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-4 pt-10">
            <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100">
               <ShieldCheck className="h-10 w-10 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Code de validation</CardTitle>
            <CardDescription className="text-slate-500 font-medium px-4">
               Nous avons envoyé un code de 6 chiffres à votre adresse {username.includes('@') ? 'email' : 'téléphone'}.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {message && (
              <Alert className={`rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 ${isSuccess ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-rose-100 bg-rose-50 text-rose-800"}`}>
                <AlertDescription className="font-bold flex items-center gap-2">
                   {isSuccess ? '✓' : '⚠'} {message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="000 000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-[1.25rem] bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  maxLength={6}
                  disabled={isLoading}
                  required
                />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">
                  Le code expire dans 10 minutes
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" 
                disabled={isLoading || otpCode.length < 6}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Valider et Continuer'
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isLoading}
                className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest text-[10px] gap-2"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Renvoyer le code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
