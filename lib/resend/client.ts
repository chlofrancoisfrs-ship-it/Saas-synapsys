import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

interface WelcomeEmailProps {
  to: string
  name: string
  language: 'fr' | 'en'
}

export async function sendWelcomeEmail({ to, name, language }: WelcomeEmailProps) {
  const subject = language === 'fr'
    ? 'Bienvenue sur Synapsys !'
    : 'Welcome to Synapsys!'

  const content = language === 'fr'
    ? `
      <h1>Bienvenue sur Synapsys, ${name} !</h1>
      <p>Nous sommes ravis de vous accueillir sur notre plateforme.</p>
      <p>Synapsys vous permet de centraliser toutes vos données business et d'optimiser votre temps pour générer du cash.</p>
      <p>Pour commencer, connectez-vous à votre tableau de bord et explorez les fonctionnalités :</p>
      <ul>
        <li>Workflows automatisés avec N8N</li>
        <li>Analytics centralisés</li>
        <li>Intégrations multiples</li>
        <li>Et bien plus encore !</li>
      </ul>
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      <p>À bientôt sur Synapsys !</p>
    `
    : `
      <h1>Welcome to Synapsys, ${name}!</h1>
      <p>We're excited to have you on our platform.</p>
      <p>Synapsys allows you to centralize all your business data and optimize your time to generate cash.</p>
      <p>To get started, log in to your dashboard and explore the features:</p>
      <ul>
        <li>Automated workflows with N8N</li>
        <li>Centralized analytics</li>
        <li>Multiple integrations</li>
        <li>And much more!</li>
      </ul>
      <p>If you have any questions, feel free to contact us.</p>
      <p>See you soon on Synapsys!</p>
    `

  try {
    const data = await resend.emails.send({
      from: 'Synapsys <onboarding@synapsys.com>',
      to,
      subject,
      html: content,
    })

    return data
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}

interface SubscriptionConfirmationEmailProps {
  to: string
  name: string
  planName: string
  amount: number
  language: 'fr' | 'en'
}

export async function sendSubscriptionConfirmationEmail({
  to,
  name,
  planName,
  amount,
  language,
}: SubscriptionConfirmationEmailProps) {
  const subject = language === 'fr'
    ? 'Confirmation de votre abonnement Synapsys'
    : 'Your Synapsys subscription confirmation'

  const content = language === 'fr'
    ? `
      <h1>Merci pour votre abonnement, ${name} !</h1>
      <p>Votre abonnement au plan <strong>${planName}</strong> a été confirmé.</p>
      <p>Montant : ${amount / 100}€/mois</p>
      <p>Vous avez maintenant accès à toutes les fonctionnalités premium de Synapsys.</p>
      <p>Connectez-vous à votre tableau de bord pour commencer à utiliser votre abonnement.</p>
    `
    : `
      <h1>Thank you for your subscription, ${name}!</h1>
      <p>Your subscription to the <strong>${planName}</strong> plan has been confirmed.</p>
      <p>Amount: €${amount / 100}/month</p>
      <p>You now have access to all premium features of Synapsys.</p>
      <p>Log in to your dashboard to start using your subscription.</p>
    `

  try {
    const data = await resend.emails.send({
      from: 'Synapsys <billing@synapsys.com>',
      to,
      subject,
      html: content,
    })

    return data
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error)
    throw error
  }
}
