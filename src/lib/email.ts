import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  static async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const template = this.getWelcomeTemplate(firstName)
    
    await resend.emails.send({
      from: 'HappyBadge <noreply@happybadge.fr>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  static async sendEventCreatedEmail(email: string, firstName: string, eventTitle: string, eventUrl: string): Promise<void> {
    const template = this.getEventCreatedTemplate(firstName, eventTitle, eventUrl)
    
    await resend.emails.send({
      from: 'HappyBadge <noreply@happybadge.fr>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  static async sendBadgeGeneratedEmail(email: string, firstName: string, eventTitle: string, badgeUrl: string): Promise<void> {
    const template = this.getBadgeGeneratedTemplate(firstName, eventTitle, badgeUrl)
    
    await resend.emails.send({
      from: 'HappyBadge <noreply@happybadge.fr>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  static async sendSubscriptionConfirmationEmail(email: string, firstName: string, planName: string): Promise<void> {
    const template = this.getSubscriptionConfirmationTemplate(firstName, planName)
    
    await resend.emails.send({
      from: 'HappyBadge <noreply@happybadge.fr>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  private static getWelcomeTemplate(firstName: string): EmailTemplate {
    return {
      subject: 'Bienvenue sur HappyBadge ! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur HappyBadge</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">HB</span>
            </div>
            <h1 style="color: #1f2937; margin: 0;">Bienvenue sur HappyBadge !</h1>
          </div>
          
          <p>Bonjour ${firstName},</p>
          
          <p>Félicitations ! Votre compte HappyBadge a été créé avec succès. Vous pouvez maintenant commencer à créer des badges personnalisés pour vos événements.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🎯 Vos premiers pas :</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Créez votre premier événement</li>
              <li>Choisissez un template de badge</li>
              <li>Partagez le lien avec vos participants</li>
              <li>Suivez les analytics en temps réel</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Accéder à mon dashboard
            </a>
          </div>
          
          <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@happybadge.fr">support@happybadge.fr</a></p>
          
          <p>Bonne création !<br>L'équipe HappyBadge</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            HappyBadge - Simplifiez la création de badges événementiels<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}">happybadge.fr</a>
          </p>
        </body>
        </html>
      `,
      text: `
        Bienvenue sur HappyBadge !
        
        Bonjour ${firstName},
        
        Félicitations ! Votre compte HappyBadge a été créé avec succès. Vous pouvez maintenant commencer à créer des badges personnalisés pour vos événements.
        
        Vos premiers pas :
        1. Créez votre premier événement
        2. Choisissez un template de badge
        3. Partagez le lien avec vos participants
        4. Suivez les analytics en temps réel
        
        Accédez à votre dashboard : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
        
        Si vous avez des questions, n'hésitez pas à nous contacter à support@happybadge.fr
        
        Bonne création !
        L'équipe HappyBadge
      `,
    }
  }

  private static getEventCreatedTemplate(firstName: string, eventTitle: string, eventUrl: string): EmailTemplate {
    return {
      subject: `Votre événement "${eventTitle}" est prêt ! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Événement créé</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">HB</span>
            </div>
            <h1 style="color: #1f2937; margin: 0;">Événement créé avec succès !</h1>
          </div>
          
          <p>Bonjour ${firstName},</p>
          
          <p>Votre événement <strong>"${eventTitle}"</strong> a été créé avec succès ! Vous pouvez maintenant commencer à générer des badges personnalisés.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🔗 Lien de votre événement :</h3>
            <p style="margin: 0;"><a href="${eventUrl}" style="color: #3b82f6; word-break: break-all;">${eventUrl}</a></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${eventUrl}" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Voir mon événement
            </a>
          </div>
          
          <p>Partagez ce lien avec vos participants pour qu'ils puissent créer leurs badges personnalisés !</p>
          
          <p>Bonne organisation !<br>L'équipe HappyBadge</p>
        </body>
        </html>
      `,
      text: `
        Événement créé avec succès !
        
        Bonjour ${firstName},
        
        Votre événement "${eventTitle}" a été créé avec succès ! Vous pouvez maintenant commencer à générer des badges personnalisés.
        
        Lien de votre événement : ${eventUrl}
        
        Partagez ce lien avec vos participants pour qu'ils puissent créer leurs badges personnalisés !
        
        Bonne organisation !
        L'équipe HappyBadge
      `,
    }
  }

  private static getBadgeGeneratedTemplate(firstName: string, eventTitle: string, badgeUrl: string): EmailTemplate {
    return {
      subject: `Votre badge pour "${eventTitle}" est prêt ! 🎨`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Badge généré</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">HB</span>
            </div>
            <h1 style="color: #1f2937; margin: 0;">Votre badge est prêt !</h1>
          </div>
          
          <p>Bonjour ${firstName},</p>
          
          <p>Votre badge personnalisé pour l'événement <strong>"${eventTitle}"</strong> a été généré avec succès !</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${badgeUrl}" alt="Votre badge" style="max-width: 300px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${badgeUrl}" download style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Télécharger mon badge
            </a>
          </div>
          
          <p>N'hésitez pas à partager votre badge sur les réseaux sociaux pour montrer votre participation à l'événement !</p>
          
          <p>Bon événement !<br>L'équipe HappyBadge</p>
        </body>
        </html>
      `,
      text: `
        Votre badge est prêt !
        
        Bonjour ${firstName},
        
        Votre badge personnalisé pour l'événement "${eventTitle}" a été généré avec succès !
        
        Téléchargez votre badge : ${badgeUrl}
        
        N'hésitez pas à partager votre badge sur les réseaux sociaux pour montrer votre participation à l'événement !
        
        Bon événement !
        L'équipe HappyBadge
      `,
    }
  }

  private static getSubscriptionConfirmationTemplate(firstName: string, planName: string): EmailTemplate {
    return {
      subject: `Abonnement ${planName} activé ! 🚀`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Abonnement activé</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">HB</span>
            </div>
            <h1 style="color: #1f2937; margin: 0;">Abonnement activé !</h1>
          </div>
          
          <p>Bonjour ${firstName},</p>
          
          <p>Félicitations ! Votre abonnement <strong>${planName}</strong> a été activé avec succès.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1f2937; margin-top: 0;">🎉 Nouvelles fonctionnalités disponibles :</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Événements illimités</li>
              <li>Templates personnalisables</li>
              <li>Analytics avancés</li>
              <li>Export des données</li>
              <li>Support prioritaire</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Accéder à mon dashboard
            </a>
          </div>
          
          <p>Merci de nous faire confiance !<br>L'équipe HappyBadge</p>
        </body>
        </html>
      `,
      text: `
        Abonnement activé !
        
        Bonjour ${firstName},
        
        Félicitations ! Votre abonnement ${planName} a été activé avec succès.
        
        Nouvelles fonctionnalités disponibles :
        - Événements illimités
        - Templates personnalisables
        - Analytics avancés
        - Export des données
        - Support prioritaire
        
        Accédez à votre dashboard : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
        
        Merci de nous faire confiance !
        L'équipe HappyBadge
      `,
    }
  }
}

