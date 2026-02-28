-- Seed existing blog posts (from original markdown content).
-- INSERT OR REPLACE so re-running this file (e.g. make db-seed-local twice) does not fail.
INSERT OR REPLACE INTO posts (id, slug, title, excerpt, content, status, created_at, updated_at) VALUES
('a1b2c3d4e5f60001', 'why-i-write-to-learn', 'Why I Write to Learn', 'Professional introvert energy: turning confusion into docs one post at a time.', 'I''m the kind of person who only really gets a concept when I have to explain it. So I write.

Writing forces me to structure the mess in my head. If I can''t write it clearly, I probably don''t understand it yet. That''s why you''ll find me turning internal docs into something readable, or turning a messy RAG pipeline into a short "here''s what we did and why" post.

**No servers were harmed** in the making of this habit—just a lot of markdown and the occasional over-engineered diagram.

If you''re the same way, you''re in good company. Write the doc. Explain it to the rubber duck. Then ship.', 'published', '2025-02-16T00:00:00.000Z', '2025-02-16T00:00:00.000Z');
