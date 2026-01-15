CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: education_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.education_level AS ENUM (
    'high_school',
    'undergraduate',
    'graduate',
    'postgraduate',
    'other'
);


--
-- Name: note_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.note_type AS ENUM (
    'pdf',
    'image',
    'markdown',
    'link'
);


--
-- Name: thought_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.thought_category AS ENUM (
    'question',
    'idea',
    'discussion',
    'research',
    'other'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')) || '_' || SUBSTRING(NEW.id::text, 1, 4)
  );
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    note_id uuid,
    thought_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: circle_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.circle_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    circle_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: circle_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.circle_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    circle_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_eli5 boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    upvotes integer DEFAULT 0,
    reply_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    note_id uuid,
    post_id uuid,
    thought_id uuid,
    parent_id uuid,
    upvotes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT comments_check CHECK ((((((note_id IS NOT NULL))::integer + ((post_id IS NOT NULL))::integer) + ((thought_id IS NOT NULL))::integer) = 1))
);


--
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    content text,
    note_type public.note_type DEFAULT 'markdown'::public.note_type,
    file_url text,
    country text,
    university text,
    subject text NOT NULL,
    tags text[],
    upvotes integer DEFAULT 0,
    views integer DEFAULT 0,
    forked_from uuid,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    username text,
    display_name text,
    avatar_url text,
    bio text,
    country text,
    university text,
    education_level public.education_level DEFAULT 'undergraduate'::public.education_level,
    subjects text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: study_circles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_circles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon_url text,
    subject_area text NOT NULL,
    member_count integer DEFAULT 0,
    post_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: thoughts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.thoughts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category public.thought_category DEFAULT 'idea'::public.thought_category,
    tags text[],
    linked_note_id uuid,
    clarity_votes integer DEFAULT 0,
    originality_votes integer DEFAULT 0,
    views integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    vote_type text NOT NULL,
    note_id uuid,
    post_id uuid,
    thought_id uuid,
    comment_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_user_id_note_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_note_id_key UNIQUE (user_id, note_id);


--
-- Name: bookmarks bookmarks_user_id_thought_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_thought_id_key UNIQUE (user_id, thought_id);


--
-- Name: circle_members circle_members_circle_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circle_members
    ADD CONSTRAINT circle_members_circle_id_user_id_key UNIQUE (circle_id, user_id);


--
-- Name: circle_members circle_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circle_members
    ADD CONSTRAINT circle_members_pkey PRIMARY KEY (id);


--
-- Name: circle_posts circle_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circle_posts
    ADD CONSTRAINT circle_posts_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: study_circles study_circles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_circles
    ADD CONSTRAINT study_circles_pkey PRIMARY KEY (id);


--
-- Name: study_circles study_circles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_circles
    ADD CONSTRAINT study_circles_slug_key UNIQUE (slug);


--
-- Name: thoughts thoughts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thoughts
    ADD CONSTRAINT thoughts_pkey PRIMARY KEY (id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: votes votes_user_id_comment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_comment_id_key UNIQUE (user_id, comment_id);


--
-- Name: votes votes_user_id_note_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_note_id_key UNIQUE (user_id, note_id);


--
-- Name: votes votes_user_id_post_id_vote_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_post_id_vote_type_key UNIQUE (user_id, post_id, vote_type);


--
-- Name: votes votes_user_id_thought_id_vote_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_thought_id_vote_type_key UNIQUE (user_id, thought_id, vote_type);


--
-- Name: idx_circle_posts_circle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_circle_posts_circle_id ON public.circle_posts USING btree (circle_id);


--
-- Name: idx_comments_note_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_note_id ON public.comments USING btree (note_id);


--
-- Name: idx_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: idx_comments_thought_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_thought_id ON public.comments USING btree (thought_id);


--
-- Name: idx_notes_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_country ON public.notes USING btree (country);


--
-- Name: idx_notes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_created_at ON public.notes USING btree (created_at DESC);


--
-- Name: idx_notes_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_subject ON public.notes USING btree (subject);


--
-- Name: idx_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_user_id ON public.notes USING btree (user_id);


--
-- Name: idx_thoughts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_thoughts_category ON public.thoughts USING btree (category);


--
-- Name: idx_thoughts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_thoughts_user_id ON public.thoughts USING btree (user_id);


--
-- Name: circle_posts update_circle_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_circle_posts_updated_at BEFORE UPDATE ON public.circle_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments update_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notes update_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: study_circles update_study_circles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_study_circles_updated_at BEFORE UPDATE ON public.study_circles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: thoughts update_thoughts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_thoughts_updated_at BEFORE UPDATE ON public.thoughts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookmarks bookmarks_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_thought_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_thought_id_fkey FOREIGN KEY (thought_id) REFERENCES public.thoughts(id) ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: circle_members circle_members_circle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circle_members
    ADD CONSTRAINT circle_members_circle_id_fkey FOREIGN KEY (circle_id) REFERENCES public.study_circles(id) ON DELETE CASCADE;


--
-- Name: circle_members circle_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circle_members
    ADD CONSTRAINT circle_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: circle_posts circle_posts_circle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circle_posts
    ADD CONSTRAINT circle_posts_circle_id_fkey FOREIGN KEY (circle_id) REFERENCES public.study_circles(id) ON DELETE CASCADE;


--
-- Name: circle_posts circle_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.circle_posts
    ADD CONSTRAINT circle_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.circle_posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_thought_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_thought_id_fkey FOREIGN KEY (thought_id) REFERENCES public.thoughts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notes notes_forked_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_forked_from_fkey FOREIGN KEY (forked_from) REFERENCES public.notes(id) ON DELETE SET NULL;


--
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: study_circles study_circles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_circles
    ADD CONSTRAINT study_circles_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: thoughts thoughts_linked_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thoughts
    ADD CONSTRAINT thoughts_linked_note_id_fkey FOREIGN KEY (linked_note_id) REFERENCES public.notes(id) ON DELETE SET NULL;


--
-- Name: thoughts thoughts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thoughts
    ADD CONSTRAINT thoughts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: votes votes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: votes votes_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- Name: votes votes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.circle_posts(id) ON DELETE CASCADE;


--
-- Name: votes votes_thought_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_thought_id_fkey FOREIGN KEY (thought_id) REFERENCES public.thoughts(id) ON DELETE CASCADE;


--
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: study_circles Authenticated users can create circles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create circles" ON public.study_circles FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: study_circles Circle creators can delete their circles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Circle creators can delete their circles" ON public.study_circles FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: study_circles Circle creators can update their circles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Circle creators can update their circles" ON public.study_circles FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: circle_members Circle members are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Circle members are viewable by everyone" ON public.circle_members FOR SELECT USING (true);


--
-- Name: circle_posts Circle members can create posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Circle members can create posts" ON public.circle_posts FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM public.circle_members
  WHERE ((circle_members.circle_id = circle_posts.circle_id) AND (circle_members.user_id = auth.uid()))))));


--
-- Name: circle_posts Circle posts are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Circle posts are viewable by everyone" ON public.circle_posts FOR SELECT USING (true);


--
-- Name: study_circles Circles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Circles are viewable by everyone" ON public.study_circles FOR SELECT USING (true);


--
-- Name: comments Comments are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);


--
-- Name: thoughts Thoughts are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Thoughts are viewable by everyone" ON public.thoughts FOR SELECT USING (true);


--
-- Name: bookmarks Users can create their own bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: bookmarks Users can delete their own bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: comments Users can delete their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: notes Users can delete their own notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: circle_posts Users can delete their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own posts" ON public.circle_posts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: thoughts Users can delete their own thoughts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own thoughts" ON public.thoughts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: votes Users can delete their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own votes" ON public.votes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: comments Users can insert their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own comments" ON public.comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: notes Users can insert their own notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own notes" ON public.notes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: thoughts Users can insert their own thoughts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own thoughts" ON public.thoughts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: votes Users can insert their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own votes" ON public.votes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: circle_members Users can join circles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join circles" ON public.circle_members FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: circle_members Users can leave circles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can leave circles" ON public.circle_members FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: comments Users can update their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notes Users can update their own notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: circle_posts Users can update their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own posts" ON public.circle_posts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: thoughts Users can update their own thoughts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own thoughts" ON public.thoughts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notes Users can view published notes or their own notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view published notes or their own notes" ON public.notes FOR SELECT USING (((is_published = true) OR (auth.uid() = user_id)));


--
-- Name: bookmarks Users can view their own bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: votes Users can view their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own votes" ON public.votes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: circle_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

--
-- Name: circle_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: study_circles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.study_circles ENABLE ROW LEVEL SECURITY;

--
-- Name: thoughts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

--
-- Name: votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;