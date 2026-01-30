create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  name text,
  subscribed boolean default false,
  created_at timestamptz default now(),
  last_message_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  media_url text,
  sent_at timestamptz,
  recipient_count int default 0
);

create table if not exists messages_log (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references contacts(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  direction text check (direction in ('in', 'out')) not null,
  content text not null,
  created_at timestamptz default now()
);

create index idx_contacts_phone on contacts(phone);
create index idx_contacts_subscribed on contacts(subscribed);
create index idx_messages_log_contact on messages_log(contact_id);
