-- Give each story-generation attempt a stable key so reloads, double-clicks,
-- and multiple browser tabs cannot start duplicate OpenAI jobs.
alter table public.stories
  add column if not exists generation_key text;

-- Preserve the most recent story for legacy generation URLs that predate keys.
with ranked_stories as (
  select
    id,
    row_number() over (
      partition by user_id, child_id, theme_id, art_style_id
      order by created_at desc, id desc
    ) as position
  from public.stories
  where generation_key is null
)
update public.stories as stories
set generation_key = concat(
  'legacy:',
  stories.user_id,
  ':',
  stories.child_id,
  ':',
  stories.theme_id,
  ':',
  stories.art_style_id
)
from ranked_stories
where stories.id = ranked_stories.id
  and ranked_stories.position = 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stories_generation_key_unique'
      and conrelid = 'public.stories'::regclass
  ) then
    alter table public.stories
      add constraint stories_generation_key_unique unique (generation_key);
  end if;
end $$;
