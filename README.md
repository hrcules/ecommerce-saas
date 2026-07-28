# 🛍️ Bewear - E-commerce SaaS Multi-tenant

Uma plataforma completa de e-commerce e SaaS (Software as a Service) multi-tenant construída com tecnologias modernas. O Bewear permite que lojistas criem e gerenciem suas próprias lojas virtuais, catálogos de produtos, estoques e vendas, tudo em um único sistema ágil e robusto.

## 🌐 Conheça a Plataforma

O Bewear é um serviço na nuvem totalmente gerenciado, criado para facilitar a vida do lojista. Para criar sua loja, conhecer nossos diferenciais ou acessar o painel administrativo, visite nossa página oficial:

**👉 Acesse:** [bewearshop.com.br](https://bewearshop.com.br)

---

## ✨ O que o Bewear oferece?

### 🏪 Para o Lojista (Painel Admin)

- **Dashboard Inteligente:** Visão geral de receita, total de vendas, produtos ativos e top 5 produtos mais vendidos com base em dados reais.
- **Gestão de Estoque:** Alertas automáticos de estoque baixo destacados diretamente no painel.
- **Gestão de Produtos e Variantes:** Cadastro detalhado de produtos com variações de cor, tamanho, precificação inteligente e controle de estoque individual.
- **Gestão de Categorias:** Geração automática de URLs amigáveis (slugs) para melhor ranqueamento e organização.
- **Customização da Loja:** Configuração de banners promocionais, identidade visual (cores da marca), taxas de frete fixo/grátis e links diretos para redes sociais (Instagram/WhatsApp).

### 🛒 Para o Cliente (Vitrine e Checkout)

- **Vitrine Dinâmica e Inteligente:**
  - _Mais Vendidos:_ Calculados automaticamente com base no histórico de pedidos (com fallback dinâmico para novas lojas).
  - _Ofertas:_ Destaque automático para os produtos com as variantes de menor preço.
  - _Lançamentos:_ Vitrine atualizada com os itens recém-adicionados.
- **Experiência do Usuário (UX):** Tratamento moderno de "Empty States" para categorias sem produtos, garantindo uma navegação fluida e sem frustrações.
- **Checkout Flexível:** Suporte híbrido a pagamentos online automáticos ou modo "Catálogo", permitindo a finalização e negociação direta via WhatsApp.
- **Notificações:** Envio de e-mails transacionais automáticos, garantindo recibos para o cliente e alertas de novas vendas para o lojista.

---

## 🛠️ Tecnologia sob o capô

Embora o foco seja a experiência final, o Bewear é construído com o que há de mais moderno, seguro e escalável no ecossistema web atual:

- **Ecossistema:** [Next.js](https://nextjs.org/) (App Router) & [TypeScript](https://www.typescriptlang.org/)
- **Interface e Estilização:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Banco de Dados & ORM:** PostgreSQL operado via [Drizzle ORM](https://orm.drizzle.team/)
- **Segurança:** Sistema de sessão e autenticação robusto via [Better Auth](https://better-auth.com/)
- **Integrações de Pagamento:** Mercado Pago e Stripe

## 🗄️ Arquitetura Multi-tenant

A infraestrutura foi desenhada desde o dia zero para suportar múltiplas lojas de forma isolada e segura. Os dados são estruturados e filtrados pelo `storeId` do lojista, separando de forma estrita o catálogo, logística, carrinho e métricas de vendas entre cada inquilino da plataforma.

---

_Tecnologia por **Bewear** - 2026 © Todos os direitos reservados._
