# MaiverCRM - SaaS SMS Automation & CRM

Sistemas SaaS multi-tenant focado em automação de mensagens (SMS via Twilio) e recuperação de vendas.

## Características
- **Multi-Tenant**: Todas as entidades isoladas por `company_id`.
- **Engine de Automação**: Substitui fluxos complexos de n8n por uma engine interna baseada em eventos.
- **Variáveis Dinâmicas**: Substituição automática com prioridade configurável.
- **Frontend Premium**: Dashboard operacional com métricas em tempo real.

## Setup
1. Instale as dependências: `npm install`
2. Configure o Supabase: Rode as migrações em `supabase/migrations/`.
3. Configure o Twilio: Adicione as credenciais no painel de configurações.

## Tecnologia
- **Frontend**: Vite + React + Vanilla CSS (Premium)
- **Backend**: Supabase (Edge Functions)
- **Mensagens**: Twilio API
