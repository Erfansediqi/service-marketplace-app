-- Khedmat scheduled Expo push receipt processing
--
-- Runs every 5 minutes.
-- The Edge Function itself only selects receipt rows whose
-- receipt_available_after timestamp has passed.
--
-- Authentication:
-- The shared webhook secret is stored encrypted in Supabase Vault.
-- It is decrypted only when the scheduled SQL executes and is sent
-- in the x-khedmat-webhook-secret request header.

create extension if not exists pg_cron;
create extension if not exists pg_net;


-- ---------------------------------------------------------------------------
-- Schedule receipt processing
-- ---------------------------------------------------------------------------

select cron.schedule(
  'khedmat-process-push-receipts',
  '*/5 * * * *',
  $$
  select net.http_post(
    url :=
      'https://wzwvczisgmhdlycbbjra.supabase.co/functions/v1/process-push-receipts',

    headers :=
      jsonb_build_object(
        'Content-Type',
        'application/json',

        'x-khedmat-webhook-secret',
        (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'khedmat_push_webhook_secret'
        )
      ),

    body :=
      '{}'::jsonb,

    timeout_milliseconds :=
      10000
  ) as request_id;
  $$
);