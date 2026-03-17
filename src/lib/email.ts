const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";

const SENDER_EMAIL = "dev.hrcules@gmail.com";

export async function sendCustomerReceiptEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: number,
  storeName: string,
  totalPriceFormatted: string,
) {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: `Equipe ${storeName}`, email: SENDER_EMAIL },
        to: [{ email: customerEmail, name: customerName }],
        subject: `Confirmação do Pedido #${orderNumber} - ${storeName}`,
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #333;">Obrigado pela sua compra, ${customerName.split(" ")[0]}! 🎉</h2>
            <p style="color: #555; line-height: 1.5;">O seu pagamento foi aprovado e a loja já foi notificada para separar o seu pedido.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Resumo do Pedido</p>
              <p style="margin: 5px 0 0 0; color: #555;">Pedido: #${orderNumber}</p>
              <p style="margin: 5px 0 0 0; color: #555;">Loja: ${storeName}</p>
              <p style="margin: 5px 0 0 0; color: #555; font-size: 18px; font-weight: bold;">Total: ${totalPriceFormatted}</p>
            </div>
            
            <p style="color: #555; font-size: 14px;">Você pode acompanhar o status da sua entrega acessando a aba "Meus Pedidos" no nosso site.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro Brevo: ${errorData}`);
    }

    console.log(`✅ Email de recibo enviado para o cliente ${customerEmail}`);
  } catch (error) {
    console.error("❌ Erro ao enviar email para o cliente:", error);
  }
}

export async function sendStoreOwnerNotificationEmail(
  ownerEmail: string,
  orderNumber: number,
  storeName: string,
  totalPriceFormatted: string,
) {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Notificações SaaS", email: SENDER_EMAIL },
        to: [{ email: ownerEmail }],
        subject: `💰 Nova Venda Realizada! Pedido #${orderNumber}`,
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; border-top: 5px solid #8B5CF6;">
            <h2 style="color: #333;">Nova Venda na ${storeName}! 🚀</h2>
            <p style="color: #555; line-height: 1.5;">Ótimas notícias! Um cliente acabou de ter o pagamento aprovado.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Detalhes da Venda</p>
              <p style="margin: 5px 0 0 0; color: #555;">Pedido: #${orderNumber}</p>
              <p style="margin: 5px 0 0 0; color: #555; font-size: 18px; font-weight: bold; color: #16a34a;">Receita: ${totalPriceFormatted}</p>
            </div>
            
            <p style="color: #555; font-size: 14px;">Acesse o seu painel Admin para ver os detalhes de envio e separar os produtos.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro Brevo: ${errorData}`);
    }

    console.log(`✅ Email de notificação enviado para o lojista ${ownerEmail}`);
  } catch (error) {
    console.error("❌ Erro ao enviar email para o lojista:", error);
  }
}
