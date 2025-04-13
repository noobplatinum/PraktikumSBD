--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.3

-- Started on 2025-03-19 11:57:25

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
-- TOC entry 2 (class 3079 OID 24576)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3390 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 869 (class 1247 OID 73729)
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.transaction_status AS ENUM (
    'pending',
    'paid'
);


ALTER TYPE public.transaction_status OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 65536)
-- Name: items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    price integer NOT NULL,
    store_id uuid NOT NULL,
    image_url character varying(255),
    stock integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.items OWNER TO neondb_owner;

--
-- TOC entry 218 (class 1259 OID 24587)
-- Name: stores; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stores (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stores OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 73733)
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity integer NOT NULL,
    total integer NOT NULL,
    status public.transaction_status DEFAULT 'pending'::public.transaction_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- TOC entry 219 (class 1259 OID 57380)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    balance integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 3383 (class 0 OID 65536)
-- Dependencies: 220
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.items (id, name, price, store_id, image_url, stock, created_at) FROM stdin;
81bab764-0c40-4e20-a8d0-125f498ad7a9	Lanyard 2	100000	a01d347b-9677-4c42-9600-1926484518cf	\N	10	2025-03-16 15:35:21.560128
a7643c77-cc2c-4a4c-844d-7a664eba8abb	Lanyard 3	100000	a01d347b-9677-4c42-9600-1926484518cf	\N	10	2025-03-16 15:35:28.73967
07f93385-f823-481f-9461-dcc60c663d18	Lanyard 4	100000	a01d347b-9677-4c42-9600-1926484518cf	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1742139361/items/xyuieapgy0giwj7px0k7.jpg	9	2025-03-16 15:36:01.732639
\.


--
-- TOC entry 3381 (class 0 OID 24587)
-- Dependencies: 218
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stores (id, name, address, created_at) FROM stdin;
a01d347b-9677-4c42-9600-1926484518cf	OOP City	Tekkom City	2025-03-12 07:20:57.205715
a88c011c-9d56-43a7-9a08-c084587fa804	UI Store 2	Depok, Universitas Indonesia	2025-03-16 15:57:59.609189
\.


--
-- TOC entry 3384 (class 0 OID 73733)
-- Dependencies: 221
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, user_id, item_id, quantity, total, status, created_at) FROM stdin;
2ac4f9d2-1380-4834-b125-acc75f8512ed	5a0e3f2c-4496-42cd-baaf-eff5202272bb	07f93385-f823-481f-9461-dcc60c663d18	1	100000	pending	2025-03-19 04:37:53.511833
\.


--
-- TOC entry 3382 (class 0 OID 57380)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, email, password, balance, created_at) FROM stdin;
b93d0d81-0c03-4100-87e1-a331c26df534	netlab	netlab2@mail.com	modul6	0	2025-03-12 05:38:44.072787
991d516c-979e-4718-8d4a-8c5551f93fff	netlab	netlab@mail.com	modul6	0	2025-03-12 15:05:49.334309
1b6771d2-05e7-4a99-8144-a3b68bf879a3	netlabX2	netlabx2@mail.com	modul6	0	2025-03-12 15:13:37.455659
dde1c25c-e2b1-437f-97c3-858169707d11	William Iskandar Updated	netlabxx@email.com	modul6dragon!	0	2025-03-19 03:27:00.856737
078f3f3b-d4e5-4111-bc0c-e385d3a03468	netlab21zz	netlxab12@mail.com	$2b$10$3v3AA/p9ckK4Ou..bZuv4ecrNPpWm/CL0XY7E1dkir1mfWzrffOPm	0	2025-03-19 03:48:22.49503
5a0e3f2c-4496-42cd-baaf-eff5202272bb	netlabfinal	netlabfinal@mail.com	$2b$10$JbX1rl15pnO9zSPu7nK2l.9j6czYRMOpchx2OSvM30xyudBeIWLju	9901000	2025-03-19 04:21:00.449678
\.


--
-- TOC entry 3230 (class 2606 OID 65545)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 3224 (class 2606 OID 24595)
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- TOC entry 3232 (class 2606 OID 73740)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3226 (class 2606 OID 57391)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3228 (class 2606 OID 57389)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3233 (class 2606 OID 65546)
-- Name: items items_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- TOC entry 3234 (class 2606 OID 73746)
-- Name: transactions transactions_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 3235 (class 2606 OID 73741)
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 2070 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2069 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-03-19 11:57:28

--
-- PostgreSQL database dump complete
--

