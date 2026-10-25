-- ============================================
-- PartyForge 008: атомарное сохранение кампании
-- ============================================
-- Функция принимает всю кампанию одним JSONB и вставляет её
-- в одной транзакции. Если что-то падает — откат целиком.

create or replace function save_campaign_atomic(
  p_user_id uuid,
  p_share_code text,
  p_title text,
  p_input jsonb,
  p_campaign jsonb,
  p_image_ids jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_campaign_id uuid;
  v_char_ids uuid[] := array[]::uuid[];
  v_loc_ids uuid[] := array[]::uuid[];
  v_fact_ids uuid[] := array[]::uuid[];
  v_char_id uuid;
  v_loc_id uuid;
  v_fact_id uuid;
  v_rec record;
  v_img uuid;
  v_loc_index int;
  v_fact_index int;
  v_char_index int;
begin
  -- ============================================
  -- 1. Кампания
  -- ============================================
  insert into campaigns (
    share_code, user_id, title, system, level, tone, theme,
    party_size, world, constraints, duration, situation,
    map_image_id, terrain_image_id
  ) values (
    p_share_code,
    p_user_id,
    p_title,
    coalesce(p_input->>'system', 'dnd5e'),
    coalesce((p_input->>'level')::int, 1),
    coalesce(p_input->>'tone', 'dark_fantasy'),
    coalesce(p_input->>'theme', 'classic'),
    coalesce((p_input->>'party_size')::int, 4),
    coalesce(p_input->>'world', 'custom'),
    coalesce(p_input->'constraints', '{}'::jsonb),
    coalesce(p_input->>'duration', 'mini_campaign'),
    p_campaign->>'situation',
    nullif(p_image_ids->>'map_image', 'null')::uuid,
    nullif(p_image_ids->>'terrain_image', 'null')::uuid
  ) returning id into v_campaign_id;

  -- ============================================
  -- 2. Мастер
  -- ============================================
  insert into campaign_members (campaign_id, user_id, role)
  values (v_campaign_id, p_user_id, 'master');

  -- ============================================
  -- 3. Статистика (upsert)
  -- ============================================
  insert into user_stats (user_id, campaigns_created)
  values (p_user_id, 1)
  on conflict (user_id) do update
    set campaigns_created = user_stats.campaigns_created + 1;

  -- ============================================
  -- 4. Персонажи + история
  -- ============================================
  for v_rec in
    select value, ordinality
    from jsonb_array_elements(p_campaign->'characters') with ordinality
  loop
    v_img := nullif(p_image_ids->'character_images'->>(v_rec.ordinality - 1), 'null')::uuid;

    insert into characters (
      campaign_id, name, class_name, race_name, background_name,
      level, role, abilities, personality, backstory, secret_text, image_id
    ) values (
      v_campaign_id,
      v_rec.value->>'name',
      v_rec.value->>'class_name',
      v_rec.value->>'race_name',
      v_rec.value->>'background_name',
      (v_rec.value->>'level')::int,
      v_rec.value->>'role',
      v_rec.value->'abilities',
      v_rec.value->'personality',
      v_rec.value->>'backstory',
      coalesce(v_rec.value->>'secret_text', ''),
      v_img
    ) returning id into v_char_id;

    v_char_ids[v_rec.ordinality] := v_char_id;

    insert into user_character_history (user_id, class_name, race_name, role)
    values (
      p_user_id,
      v_rec.value->>'class_name',
      v_rec.value->>'race_name',
      v_rec.value->>'role'
    );
  end loop;

  -- ============================================
  -- 5. Локации
  -- ============================================
  for v_rec in
    select value, ordinality
    from jsonb_array_elements(p_campaign->'locations') with ordinality
  loop
    v_img := nullif(p_image_ids->'location_images'->>(v_rec.ordinality - 1), 'null')::uuid;

    insert into locations (campaign_id, name, type, description, image_id)
    values (
      v_campaign_id,
      v_rec.value->>'name',
      v_rec.value->>'type',
      v_rec.value->>'description',
      v_img
    ) returning id into v_loc_id;

    v_loc_ids[v_rec.ordinality] := v_loc_id;
  end loop;

  -- ============================================
  -- 6. Фракции
  -- ============================================
  for v_rec in
    select value, ordinality
    from jsonb_array_elements(p_campaign->'factions') with ordinality
  loop
    insert into factions (campaign_id, name, goals, attitude, description)
    values (
      v_campaign_id,
      v_rec.value->>'name',
      v_rec.value->>'goals',
      v_rec.value->>'attitude',
      v_rec.value->>'description'
    ) returning id into v_fact_id;

    v_fact_ids[v_rec.ordinality] := v_fact_id;
  end loop;

  -- ============================================
  -- 7. Связи
  -- ============================================
  for v_rec in
    select value from jsonb_array_elements(p_campaign->'relationships')
  loop
    v_char_index := (v_rec.value->>'source_character_index')::int + 1;
    insert into relationships (
      campaign_id, source_character_id, target_character_id, type, description
    ) values (
      v_campaign_id,
      v_char_ids[v_char_index],
      v_char_ids[(v_rec.value->>'target_character_index')::int + 1],
      v_rec.value->>'type',
      v_rec.value->>'description'
    );
  end loop;

  -- ============================================
  -- 8. Связи персонаж-локация
  -- ============================================
  for v_rec in
    select value from jsonb_array_elements(p_campaign->'character_locations')
  loop
    insert into character_locations (
      campaign_id, character_id, location_id, connection_type
    ) values (
      v_campaign_id,
      v_char_ids[(v_rec.value->>'character_index')::int + 1],
      v_loc_ids[(v_rec.value->>'location_index')::int + 1],
      v_rec.value->>'connection_type'
    );
  end loop;

  -- ============================================
  -- 9. NPC
  -- ============================================
  for v_rec in
    select value, ordinality
    from jsonb_array_elements(p_campaign->'npcs') with ordinality
  loop
    v_img := nullif(p_image_ids->'npc_images'->>(v_rec.ordinality - 1), 'null')::uuid;

    v_loc_index := nullif(v_rec.value->>'location_index', 'null')::int;
    v_fact_index := nullif(v_rec.value->>'faction_index', 'null')::int;

    insert into npcs (
      campaign_id, name, role, description, location_id, faction_id, image_id
    ) values (
      v_campaign_id,
      v_rec.value->>'name',
      v_rec.value->>'role',
      v_rec.value->>'description',
      case when v_loc_index is not null then v_loc_ids[v_loc_index + 1] else null end,
      case when v_fact_index is not null then v_fact_ids[v_fact_index + 1] else null end,
      v_img
    );
  end loop;

  -- ============================================
  -- 10. Крючки
  -- ============================================
  for v_rec in
    select value from jsonb_array_elements(p_campaign->'hooks')
  loop
    v_char_index := nullif(v_rec.value->>'character_index', 'null')::int;

    insert into hooks (
      campaign_id, title, description, type, character_id, template_id, metadata
    ) values (
      v_campaign_id,
      v_rec.value->>'title',
      v_rec.value->>'description',
      v_rec.value->>'type',
      case when v_char_index is not null then v_char_ids[v_char_index + 1] else null end,
      nullif(v_rec.value->>'template_id', 'null')::uuid,
      coalesce(v_rec.value->'metadata', '{}'::jsonb)
    );
  end loop;

  -- ============================================
  -- Возврат
  -- ============================================
  return jsonb_build_object(
    'campaign_id', v_campaign_id,
    'share_code', p_share_code
  );
end;
$$;

-- Права на выполнение (RLS обходится через security definer)
grant execute on function save_campaign_atomic(uuid, text, text, jsonb, jsonb, jsonb)
  to authenticated, service_role;