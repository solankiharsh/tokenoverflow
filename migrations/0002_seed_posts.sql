-- Seed existing blog posts (from original markdown content).
-- INSERT OR REPLACE so re-running this file (e.g. make db-seed-local twice) does not fail.
INSERT OR REPLACE INTO posts (id, slug, title, excerpt, content, status, created_at, updated_at) VALUES
('a1b2c3d4e5f60001', 'why-i-write-to-learn', 'Why I Write to Learn', 'Professional introvert energy: turning confusion into docs one post at a time.', 'I''m the kind of person who only really gets a concept when I have to explain it. So I write.

Writing forces me to structure the mess in my head. If I can''t write it clearly, I probably don''t understand it yet. That''s why you''ll find me turning internal docs into something readable, or turning a messy RAG pipeline into a short "here''s what we did and why" post.

**No servers were harmed** in the making of this habit—just a lot of markdown and the occasional over-engineered diagram.

If you''re the same way, you''re in good company. Write the doc. Explain it to the rubber duck. Then ship.', 'published', '2025-02-16T00:00:00.000Z', '2025-02-16T00:00:00.000Z'),
('a1b2c3d4e5f60002', 'rag-in-5-minutes', 'RAG in 5 Minutes', 'Retrieval-Augmented Generation without the buzzword soup.', '**RAG** = get the right chunks of your data, stuff them into the prompt, let the model answer. That''s it.

1. **Chunk** your docs (by paragraph or section).
2. **Embed** chunks with an embedding model; store in a vector DB.
3. **Query**: embed the user question, find the k nearest chunks.
4. **Prompt**: "Here''s the context: … Now answer: …"

You''re not fine-tuning. You''re not retraining. You''re just giving the model the right context so it doesn''t hallucinate your internal wiki.

I''ve built and shipped RAG pipelines at scale (ingestion, retries, quotas, the works). The hard part is usually ops and data quality, not the algorithm. More on that in a future post.', 'published', '2025-02-15T00:00:00.000Z', '2025-02-15T00:00:00.000Z');
