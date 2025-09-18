--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (02a153c)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    description text,
    is_active integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: expense_wallets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expense_wallets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date timestamp without time zone NOT NULL
);


ALTER TABLE public.expense_wallets OWNER TO neondb_owner;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expenses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    category_id character varying NOT NULL,
    vendor text,
    date timestamp without time zone NOT NULL,
    receipt_path text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.expenses OWNER TO neondb_owner;

--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    azure_object_id text,
    is_active integer DEFAULT 1 NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, color, description, is_active) FROM stdin;
95a60e20-3067-4aa7-961f-f07c9f73dd02	Parties	#84cc16	Office parties or functions.	0
a7e59ce6-2704-4e16-8873-6e3c7b607eef	Other	#6b7280	Other business expenses	0
fd4a7ef7-24f0-4142-a771-5cfc41a4f6b7	Utilities	#8b5cf6	Office utilities and services	0
c6838c28-ff33-478f-b7fd-4a23f8c0c593	Meals & Entertainment	#f59e0b	Client meals and entertainment	0
44f224ff-c358-4f32-b0c5-6792b3a13f4a	Travel	#10b981	Business travel expenses	0
29721dbf-c551-4226-97f7-0d94b6682bb1	Office Supplies	#3b82f6	Office materials, stationery, and supplies	0
a4eec91a-8d46-4988-b9fa-f596556e64f2	Kitchen	#ec4899		1
63a87274-5e5a-495e-a11f-7cba59aec5b5	Washroom	#6b7280		1
ea7b9976-ecea-440e-9491-9af79488265c	Birthdays	#8b5cf6		1
f3c34154-3304-4886-960f-b32f026b434f	Hardware and stationary	#f59e0b		1
8a878cfb-4e3d-4280-94d2-b7bb2e11854c	Cultural Events	#10b981		1
52ec082a-06ee-4d96-b5c8-2ba0c4430e5e	Festivals	#84cc16		1
c8a0fa4e-82e5-4d62-a21e-7e08535e0fe8	Wellness	#06b6d4		1
8689942b-0f3b-41ee-97cb-3c2c0d4f10a6	Other Expenses	#3b82f6	Travels/claims	1
9b0b137f-44f0-4bfc-873f-afb188694fce	Repairs and Maintenance	#ef4444	Water/plumbing/Electrical/Office decoration	1
\.


--
-- Data for Name: expense_wallets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expense_wallets (id, amount, description, created_at, updated_at, date) FROM stdin;
a5ac7a4d-fe31-45e7-992e-35eb30ce23ea	12368.00	April Expenses opening Balance	2025-09-16 10:02:04.817509	2025-09-16 10:09:59.662	2025-04-01 00:00:00
5f04883b-2cc7-4b67-b8b4-e44fff1c5ba7	15000.00	May Expenses	2025-09-16 10:02:20.89033	2025-09-16 10:10:12.803	2025-05-06 00:00:00
567ad399-d629-4de3-bf6f-379afe49e2fc	15000.00	June Expenses	2025-09-16 10:02:38.263877	2025-09-16 10:10:22.241	2025-06-05 00:00:00
c167f6e2-2b12-4f85-ad65-495c96234c1f	15000.00	July Expenses	2025-09-16 10:02:52.194117	2025-09-16 10:10:52.866	2025-07-05 00:00:00
271e4907-679a-401c-97f3-c3db64b3be99	15000.00	August Expenses	2025-09-16 10:11:21.700548	2025-09-16 10:11:21.700548	2025-08-06 00:00:00
ca04f7e6-ede3-4602-8da8-76e194827390	15000.00	September Expenses	2025-09-16 10:11:40.988816	2025-09-16 10:11:40.988816	2025-09-05 00:00:00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expenses (id, description, amount, category_id, vendor, date, receipt_path, notes, created_at, updated_at) FROM stdin;
6b7ba86e-bf46-42b7-ad1d-7755e5fd2f4f	Cake for Navalika & Neha Birthday (1 1/2kg)	927.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-09-03 00:00:00	\N	\N	2025-09-09 07:12:50.912461	2025-09-09 07:12:50.912461
468674ad-e695-47a1-a9d0-4bd28f3f8937	Kaju(95rs),Kissmiss(55),Jaggery(80) for sweet on the occassion of Onam&vinayaka chavithi prasadam	170.00	52ec082a-06ee-4d96-b5c8-2ba0c4430e5e	\N	2025-09-05 00:00:00	\N	\N	2025-09-09 07:12:50.953264	2025-09-09 07:12:50.953264
1a82fdc4-115d-416b-97a1-2d8159f64d19	Banthi flower mala-25 Muralu(each 20/-)	500.00	52ec082a-06ee-4d96-b5c8-2ba0c4430e5e		2025-08-25 00:00:00	\N		2025-09-09 07:12:50.871568	2025-09-09 07:16:40.132
ca5afabe-7649-4304-bbbc-2a948227d305	Cleaning Liquids	780.00	63a87274-5e5a-495e-a11f-7cba59aec5b5		2025-06-09 00:00:00	\N		2025-09-09 10:26:52.469935	2025-09-09 10:26:52.469935
87f590a0-1c61-42b9-bd24-012d584567a5	Milk for the Month of Aug(85lits*64packets)+300delivery	5740.00	a4eec91a-8d46-4988-b9fa-f596556e64f2		2025-09-08 00:00:00	\N		2025-09-09 07:12:50.99445	2025-09-09 10:41:29.132
48686084-b3bb-4d91-acd9-ee8338cdd332	Groceries	1617.00	a4eec91a-8d46-4988-b9fa-f596556e64f2		2025-06-06 00:00:00	\N		2025-09-09 10:25:11.774354	2025-09-09 10:25:11.774354
d7c489da-78bc-4a1b-b58b-69266ffeaca9	Tea Powder-1kg, Reynolds pens-25, handling charges-12rs	600.81	a4eec91a-8d46-4988-b9fa-f596556e64f2		2025-09-08 00:00:00	\N		2025-09-09 10:42:01.715869	2025-09-09 10:42:01.715869
be28062d-cfc6-4e86-9ffa-c9eda200d397	Water tin(46 cans@June month)	1380.00	a4eec91a-8d46-4988-b9fa-f596556e64f2		2025-09-09 00:00:00	\N		2025-09-16 11:00:30.44111	2025-09-16 11:00:30.44111
8125f045-f672-4d9d-bd70-03661e3c4da8	BB dustbin covers-M size-3,vim soaps-12+handling charges(big basket)	311.44	63a87274-5e5a-495e-a11f-7cba59aec5b5		2025-09-10 00:00:00	\N		2025-09-16 11:02:31.165941	2025-09-16 11:02:31.165941
da1fc353-320a-4878-8b4a-46877cca2db9	Odonil spray etc	495.97	63a87274-5e5a-495e-a11f-7cba59aec5b5		2025-09-10 00:00:00	\N		2025-09-16 11:04:10.087861	2025-09-16 11:04:10.087861
bb3d0ce7-4328-4a71-aaf8-719b2dcb2795	Tea Powder	155.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-01 00:00:00	\N	\N	2025-09-09 07:12:47.37366	2025-09-09 07:12:47.37366
d6399744-51cf-4382-8047-7e344901cbb7	Sugar	120.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-01 00:00:00	\N	\N	2025-09-09 07:12:47.428911	2025-09-09 07:12:47.428911
7776c402-d4ba-446c-9813-30070d72aaca	Spoon stand	188.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-03 00:00:00	\N	\N	2025-09-09 07:12:47.470368	2025-09-09 07:12:47.470368
988d752d-e07e-409b-a727-0b8182f804a0	Tea Powder	600.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-04 00:00:00	\N	\N	2025-09-09 07:12:47.511833	2025-09-09 07:12:47.511833
1317f87f-6995-4089-9a4e-d4675d4316de	Sugar	260.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-04 00:00:00	\N	\N	2025-09-09 07:12:47.551862	2025-09-09 07:12:47.551862
caf03877-ccf6-491b-beca-d13880207d97	Semiya	64.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-04 00:00:00	\N	\N	2025-09-09 07:12:47.591608	2025-09-09 07:12:47.591608
9c0a4fca-6a9e-42c2-97de-d82aec9ac0da	Water	70.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-04 00:00:00	\N	\N	2025-09-09 07:12:47.632804	2025-09-09 07:12:47.632804
1a7b4afa-d22c-4817-bb2b-095c389eac18	Kheer ingradients	287.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-04 00:00:00	\N	\N	2025-09-09 07:12:47.673658	2025-09-09 07:12:47.673658
c5707a2d-c2ab-4039-a781-42a85624e83b	A/C leaking	700.00	9b0b137f-44f0-4bfc-873f-afb188694fce	\N	2025-04-10 00:00:00	\N	\N	2025-09-09 07:12:47.714557	2025-09-09 07:12:47.714557
38bb8806-4fd5-4b09-bffc-b1466e283f24	Room freshner	400.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-04-10 00:00:00	\N	\N	2025-09-09 07:12:47.756586	2025-09-09 07:12:47.756586
11a8fd61-0afe-447f-b46e-e9fb6ca80952	Bathroom freshner	247.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-04-10 00:00:00	\N	\N	2025-09-09 07:12:47.79733	2025-09-09 07:12:47.79733
599ace35-a464-44ae-a63b-2245cbfd50d8	Garbage covers	140.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-04-10 00:00:00	\N	\N	2025-09-09 07:12:47.838064	2025-09-09 07:12:47.838064
22bd39a2-382e-4ea9-ab2b-e008388fa5a3	Handling charges	6.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-04-10 00:00:00	\N	\N	2025-09-09 07:12:47.880074	2025-09-09 07:12:47.880074
06005b80-79af-4d96-ac8a-73d707aa51ab	Swarna B'day	1146.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-04-10 00:00:00	\N	\N	2025-09-09 07:12:47.921024	2025-09-09 07:12:47.921024
50658f62-9941-4d29-8dad-5c9e4adbfb35	Lizol	300.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-04-11 00:00:00	\N	\N	2025-09-09 07:12:47.962109	2025-09-09 07:12:47.962109
840dcf17-5c15-4d6d-ab2a-e36221a02ad3	Harpic	300.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-04-11 00:00:00	\N	\N	2025-09-09 07:12:48.003295	2025-09-09 07:12:48.003295
7f21f7aa-ff93-4ea7-9f1c-2bd25410cab5	Scissors	60.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-04-11 00:00:00	\N	\N	2025-09-09 07:12:48.044221	2025-09-09 07:12:48.044221
88cc7f00-d050-4572-8605-d98a1254a692	Tea powder	540.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-15 00:00:00	\N	\N	2025-09-09 07:12:48.085175	2025-09-09 07:12:48.085175
f4ab09f6-77a8-49da-9c5e-8a08cc04040c	Sugar	256.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-15 00:00:00	\N	\N	2025-09-09 07:12:48.126318	2025-09-09 07:12:48.126318
fd3a4da9-b544-4614-b638-068377223024	Vim	30.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-15 00:00:00	\N	\N	2025-09-09 07:12:48.167518	2025-09-09 07:12:48.167518
10219f88-cbb5-4b02-84b7-ceba37161601	Handling charges	6.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-15 00:00:00	\N	\N	2025-09-09 07:12:48.208958	2025-09-09 07:12:48.208958
f129c77d-69d5-4d1f-9c70-86ee7d8c80ba	Tea powder	434.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-29 00:00:00	\N	\N	2025-09-09 07:12:48.249824	2025-09-09 07:12:48.249824
bb2950ff-6f75-47cd-a3d3-53ba9a28a1e9	Sugar	256.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-29 00:00:00	\N	\N	2025-09-09 07:12:48.291092	2025-09-09 07:12:48.291092
03d0bd16-9218-4d35-b0bd-fbe4d33d4d07	Handling charges	6.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-04-29 00:00:00	\N	\N	2025-09-09 07:12:48.332392	2025-09-09 07:12:48.332392
cf327b28-5ff2-4882-963e-6a626af221fa	Washroom hose pipe+tap	490.00	9b0b137f-44f0-4bfc-873f-afb188694fce	\N	2025-05-05 00:00:00	\N	\N	2025-09-09 07:12:48.373096	2025-09-09 07:12:48.373096
a148e9a8-82f4-4237-9ec1-7d13119f1d9f	Booking in Urban company	167.00	9b0b137f-44f0-4bfc-873f-afb188694fce	\N	2025-05-05 00:00:00	\N	\N	2025-09-09 07:12:48.413682	2025-09-09 07:12:48.413682
78daabc2-66fd-4235-8058-8b95e7370ab7	Milk expenses for April	7771.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-07 00:00:00	\N	\N	2025-09-09 07:12:48.454862	2025-09-09 07:12:48.454862
c65c48fe-9358-47e1-bec6-63e895b1a1e8	Garbage covers	140.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.496588	2025-09-09 07:12:48.496588
8e5c9781-5e9e-4ddd-8e44-88a2610ad9ab	Handwash	205.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.537535	2025-09-09 07:12:48.537535
437a0c6d-b3d7-4759-8185-9109d2d08cd6	Odonil washroom freshner	264.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.578116	2025-09-09 07:12:48.578116
86a83fcd-774c-497c-89ba-534c8fe2372e	Odonil Room freshner	250.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.619234	2025-09-09 07:12:48.619234
3ff6aea6-04e8-41f7-ba35-d2967f0624fd	Tide Surf	80.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.660086	2025-09-09 07:12:48.660086
5209401e-e211-4856-836b-bd08e7289cf2	Vim Soaps	40.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.702168	2025-09-09 07:12:48.702168
a674eec2-b373-44ef-a602-c64c90def2c7	Scrubber-steel 	20.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.743343	2025-09-09 07:12:48.743343
b1bb0957-a961-44c0-bde5-1f5566f1b1b5	Green scrubber	140.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.784081	2025-09-09 07:12:48.784081
6b68458f-550c-4487-95a2-d578a80272fc	Eveready batteries	64.00	f3c34154-3304-4886-960f-b32f026b434f	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.826211	2025-09-09 07:12:48.826211
ee9e4a05-36d7-491c-b57c-e87f447f8aec	Handling charges	6.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.866875	2025-09-09 07:12:48.866875
53a06f4d-bb6e-447b-b30e-20d57663eebf	Water Bill(Drinking water)	1560.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.90794	2025-09-09 07:12:48.90794
17d71bb1-c792-4dcd-8a95-8f5dee5d468f	Colin	300.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.949009	2025-09-09 07:12:48.949009
e6617c99-1023-4923-8e5e-662c1acd75af	Mop	270.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:48.988574	2025-09-09 07:12:48.988574
bb33c6fc-95d2-40f2-a532-8d0c6c35a1d6	Drain cleaners	64.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-05-09 00:00:00	\N	\N	2025-09-09 07:12:49.029131	2025-09-09 07:12:49.029131
ad1202cd-d0ef-4789-80f7-adc4d3a92337	Water Tanker Bill	2220.00	9b0b137f-44f0-4bfc-873f-afb188694fce	\N	2025-05-13 00:00:00	\N	\N	2025-09-09 07:12:49.06856	2025-09-09 07:12:49.06856
01e58c72-d576-4cc9-8cdc-b9e46d65fdb5	Tea Powder	434.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-16 00:00:00	\N	\N	2025-09-09 07:12:49.110369	2025-09-09 07:12:49.110369
0ddf62a8-e627-4ac3-aecd-3e2527a259eb	Sugar	256.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-16 00:00:00	\N	\N	2025-09-09 07:12:49.151297	2025-09-09 07:12:49.151297
f90edc51-97da-43dd-b3dc-a8e160a33920	Delivery charge	6.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-16 00:00:00	\N	\N	2025-09-09 07:12:49.192217	2025-09-09 07:12:49.192217
603b3e6b-d549-4cfa-9320-6d9bf68ff3af	Pen (for Sir)	240.00	f3c34154-3304-4886-960f-b32f026b434f	\N	2025-05-16 00:00:00	\N	\N	2025-09-09 07:12:49.233069	2025-09-09 07:12:49.233069
276a0777-c112-4fe1-8dfa-c46788aa9a0e	Samosae,Veg puff	900.00	8a878cfb-4e3d-4280-94d2-b7bb2e11854c	\N	2025-05-22 00:00:00	\N	\N	2025-09-09 07:12:49.273581	2025-09-09 07:12:49.273581
86226e9e-fd5b-4566-ad49-b9e431566afd	Water dispenser kit	495.00	9b0b137f-44f0-4bfc-873f-afb188694fce	\N	2025-05-27 00:00:00	\N	\N	2025-09-09 07:12:49.314642	2025-09-09 07:12:49.314642
2c9b5717-da02-44d6-9642-bcaa533afc07	Delivery charge	75.00	9b0b137f-44f0-4bfc-873f-afb188694fce	\N	2025-05-27 00:00:00	\N	\N	2025-09-09 07:12:49.356032	2025-09-09 07:12:49.356032
43209e52-c3f4-4ee5-8bb2-5e3e0420fa42	Tea Powder	416.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-28 00:00:00	\N	\N	2025-09-09 07:12:49.395594	2025-09-09 07:12:49.395594
17ff2f53-dd8b-498c-83ac-7a3750e5fdc3	Sugar	267.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-28 00:00:00	\N	\N	2025-09-09 07:12:49.436527	2025-09-09 07:12:49.436527
9c439c07-fd35-4f2c-aec0-8653236a0435	Handling charges	6.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-05-28 00:00:00	\N	\N	2025-09-09 07:12:49.476567	2025-09-09 07:12:49.476567
d97a1993-9b63-405e-8f62-451926c1be61	Bhanu Birthday	1000.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-05-28 00:00:00	\N	\N	2025-09-09 07:12:49.517278	2025-09-09 07:12:49.517278
b7a5b4dc-b76d-4a91-b7da-60c83fe90ca8	rope and clips	95.00	9b0b137f-44f0-4bfc-873f-afb188694fce	\N	2025-05-29 00:00:00	\N	\N	2025-09-09 07:12:49.557989	2025-09-09 07:12:49.557989
1873decc-404f-41e1-a70e-71406fdedb86	Cake for Thirumalesh B.day	850.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-06-16 00:00:00	\N	\N	2025-09-09 07:12:49.598956	2025-09-09 07:12:49.598956
f61502f0-32e9-4d82-b979-8e2cf6f15bfc	Renuka-for Pooja items balance	150.00	52ec082a-06ee-4d96-b5c8-2ba0c4430e5e	\N	2025-06-18 00:00:00	\N	\N	2025-09-09 07:12:49.639806	2025-09-09 07:12:49.639806
61c35da5-211d-40b6-a4fb-d007971b3a19	Tea powder(1kg) & Sugar(5kg)	784.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-06-19 00:00:00	\N	\N	2025-09-09 07:12:49.680788	2025-09-09 07:12:49.680788
714af031-ae0e-49eb-b683-2306fb1f92cf	Water tin(50cans)- paid	1500.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-06-20 00:00:00	\N	\N	2025-09-09 07:12:49.721979	2025-09-09 07:12:49.721979
0b522f01-c90d-4e35-a4ee-06bdba70b64e	Tea powder(1kg) & Sugar(5kg)	675.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-03 00:00:00	\N	\N	2025-09-09 07:12:49.762568	2025-09-09 07:12:49.762568
79fcaeba-b32a-411f-8676-868642ded94d	Water tin(49 cans@May month)	1475.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-03 00:00:00	\N	\N	2025-09-09 07:12:49.803214	2025-09-09 07:12:49.803214
9bfa06c8-225a-4fc5-88e6-4a1f5245f2df	dettol liquid-1,odonil-1,dustbin covers-2,odonil sparys-2,exo soaps-12,tide surf-1/2kg	558.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-07-04 00:00:00	\N	\N	2025-09-09 07:12:49.843756	2025-09-09 07:12:49.843756
29b045ee-8d66-4321-879e-cdcce587367b	Odonil freshers-4,gala mop-1,dusting cloths-6	490.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-07-04 00:00:00	\N	\N	2025-09-09 07:12:49.884262	2025-09-09 07:12:49.884262
b0d7abe6-2885-457f-aa48-8f2851f4c74d	Milk for the month of june	8172.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-08 00:00:00	\N	\N	2025-09-09 07:12:49.925064	2025-09-09 07:12:49.925064
07413262-6366-4904-8c53-3abce01ffc3d	Cake for Chandhu Birthday	900.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-07-14 00:00:00	\N	\N	2025-09-09 07:12:49.965512	2025-09-09 07:12:49.965512
03ee50c4-ecbe-4c19-9bc0-f849cb89dac6	Tea powder 500gm	285.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-14 00:00:00	\N	\N	2025-09-09 07:12:50.006407	2025-09-09 07:12:50.006407
91041fcf-7274-4733-9fa9-777d1a3eb1b3	first aid kit items	302.00	c8a0fa4e-82e5-4d62-a21e-7e08535e0fe8	\N	2025-07-15 00:00:00	\N	\N	2025-09-09 07:12:50.047265	2025-09-09 07:12:50.047265
1bb5c437-3d06-46fe-9d50-4c9cf4740a16	Sugar 5kg & bru coffee powder 100gm	324.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-16 00:00:00	\N	\N	2025-09-09 07:12:50.087863	2025-09-09 07:12:50.087863
d9995efc-f2dc-42ae-bde9-25b41078acea	Napkin holder for ladies wash room	105.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-07-18 00:00:00	\N	\N	2025-09-09 07:12:50.130453	2025-09-09 07:12:50.130453
9102316e-c072-4f42-874d-b873153b373a	Tea powder 500gm-4(Defence canteen)	708.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-19 00:00:00	\N	\N	2025-09-09 07:12:50.170964	2025-09-09 07:12:50.170964
2e2b0e4a-b8c3-409b-92dc-680c98d47232	Strain less spoons-6	150.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-23 00:00:00	\N	\N	2025-09-09 07:12:50.21064	2025-09-09 07:12:50.21064
68414c71-55c7-4289-ad27-1bc4336cd2d6	Cake for Ratna Kiran Birthday	750.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-07-23 00:00:00	\N	\N	2025-09-09 07:12:50.251388	2025-09-09 07:12:50.251388
2e752972-ef84-4a90-b642-8770a29f27f8	Advance paid for ID cards to Print Alt vendor(reamaining 3050 sir paid)	2000.00	8689942b-0f3b-41ee-97cb-3c2c0d4f10a6	\N	2025-07-29 00:00:00	\N	\N	2025-09-09 07:12:50.29561	2025-09-09 07:12:50.29561
169e60b6-3359-46df-b058-1796caf3f048	Sugar 5Kg  	249.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-07-30 00:00:00	\N	\N	2025-09-09 07:12:50.337054	2025-09-09 07:12:50.337054
17939d84-0ccd-4b47-a353-ba6e0467181e	Cake for Sanjay Birthday	750.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-08-05 00:00:00	\N	\N	2025-09-09 07:12:50.377819	2025-09-09 07:12:50.377819
28e2111e-8f5c-411d-91bb-f0eee111ae78	Advance paid for Surya trophy shop	400.00	8a878cfb-4e3d-4280-94d2-b7bb2e11854c	\N	2025-08-05 00:00:00	\N	\N	2025-09-09 07:12:50.422587	2025-09-09 07:12:50.422587
1773002e-f96d-4019-aabe-164f9389a7dd	payment cleared for Surya Trophy(2- quantity)	400.00	8a878cfb-4e3d-4280-94d2-b7bb2e11854c	\N	2025-08-06 00:00:00	\N	\N	2025-09-09 07:12:50.463211	2025-09-09 07:12:50.463211
e26158e1-d726-4b1a-ac52-b7b20795c928	Cake for Suneel Birthday	730.00	ea7b9976-ecea-440e-9491-9af79488265c	\N	2025-08-06 00:00:00	\N	\N	2025-09-09 07:12:50.504111	2025-09-09 07:12:50.504111
81ecdb29-07ac-4c1b-849d-dd99fa6002de	510 paid for 1kg Samiya,elachi,cow ghee,normal ghee,kaju,kissmiss,banana,flowers	510.00	52ec082a-06ee-4d96-b5c8-2ba0c4430e5e	\N	2025-08-07 00:00:00	\N	\N	2025-09-09 07:12:50.544962	2025-09-09 07:12:50.544962
9f6a52cf-c7a6-4c02-aa19-e7273c1d2307	Lizol,harpic,colin,pressure stick brought by Latha	995.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-08-07 00:00:00	\N	\N	2025-09-09 07:12:50.584568	2025-09-09 07:12:50.584568
1855a969-5704-4a11-8e0b-25123cca123f	dettol liquid-1,odonil-5,dustbin covers-2,odonil sparys-3,exo soaps-12,tide surf-1kg,Rin soap	1070.00	63a87274-5e5a-495e-a11f-7cba59aec5b5	\N	2025-08-07 00:00:00	\N	\N	2025-09-09 07:12:50.625194	2025-09-09 07:12:50.625194
950e123b-90b1-4e87-a747-f99d4516ce89	Milk for the month of July	8620.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-08-07 00:00:00	\N	\N	2025-09-09 07:12:50.665876	2025-09-09 07:12:50.665876
bb8537a0-0ad7-4b31-9553-afa0ca512344	Marij 6/16A Converter-3	255.00	f3c34154-3304-4886-960f-b32f026b434f	\N	2025-08-11 00:00:00	\N	\N	2025-09-09 07:12:50.705557	2025-09-09 07:12:50.705557
bf100809-e833-43a1-bbb0-fc84c18295b3	Sooji ravva-1kg,ghee-100gm,kaju,kissmiss-50gm,spoons(100)	300.00	52ec082a-06ee-4d96-b5c8-2ba0c4430e5e	\N	2025-08-14 00:00:00	\N	\N	2025-09-09 07:12:50.746352	2025-09-09 07:12:50.746352
c5a4429a-c386-424c-a194-e50af968a327	Milk-3, sugar-5kg	324.00	52ec082a-06ee-4d96-b5c8-2ba0c4430e5e	\N	2025-08-14 00:00:00	\N	\N	2025-09-09 07:12:50.790356	2025-09-09 07:12:50.790356
224c73ff-86a9-45d6-a24e-2e1cd8af3486	Red lable tea powder-1kg	458.00	a4eec91a-8d46-4988-b9fa-f596556e64f2	\N	2025-08-25 00:00:00	\N	\N	2025-09-09 07:12:50.831634	2025-09-09 07:12:50.831634
cb91b07d-6e8b-44cc-95c9-f7465f9c2d5b	Milk Expenses	7833.00	a4eec91a-8d46-4988-b9fa-f596556e64f2		2025-06-06 00:00:00	\N		2025-09-09 10:26:23.045676	2025-09-09 10:26:23.045676
f18c2123-0e4c-4cf1-ab59-8335c5577dda	Plant pot and plate	70.00	9b0b137f-44f0-4bfc-873f-afb188694fce		2025-09-08 00:00:00	\N		2025-09-09 10:43:05.05145	2025-09-09 10:43:05.05145
4e2264ff-f540-43ee-90c8-99c3264ce6b4	mop-1,Brooms-2	450.00	a4eec91a-8d46-4988-b9fa-f596556e64f2		2025-09-10 00:00:00	\N		2025-09-16 11:05:13.066829	2025-09-17 10:55:10.832
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
gRdU-L19EDBzZvG4ws4N9lRJ6b6_GyZb	{"cookie":{"originalMaxAge":86400000,"expires":"2025-09-18T10:51:59.531Z","secure":false,"httpOnly":true,"path":"/"},"accessToken":"eyJ0eXAiOiJKV1QiLCJub25jZSI6Imh2eGtveHg4ZXZOcVRGTG1vaEtFYkZ2bFZRNmNUNlJoRjNlbDhWTnItbUkiLCJhbGciOiJSUzI1NiIsIng1dCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQvIiwiaWF0IjoxNzU4MTA2MDE1LCJuYmYiOjE3NTgxMDYwMTUsImV4cCI6MTc1ODExMDAwNywiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQWRRQUsvOFpBQUFBWVlNZjArejdrMENwTDdjYVJCZUkzQlVMUklyamd2Ny9EbWM3QmZhU1FBQ2hEYUs4aHNBS2dyNEt4ZmlidVZjYzJ0dmlyN0x3UnRUeHVzWHpRSlVZN040dUxlZGM2eXhpSVd2L0FQK1RDaTFBVjBnOE9OcCtEK2h6WU14OWVkbEdkNFpIbzlacmFQQlpWUzlOdDZ6b2xpTHFhUjA1aGVzUGhtWSs5dDRvUFRudTBNaWtaM2tSV1dSQWlhR2t4ZXRhQkdPQS9kbW1tcXArZWpYRVhOb0hZNzdmbWtiSG9yR2tFR0MvYy9Pd2xaNW81elFPRmQ1Y3hHRTNFeG5IcXlIc3Y0TnE5TnhEKzFaNGJkYXpNZS85M2c9PSIsImFtciI6WyJyc2EiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRkRFUy1Qb3J0YWwiLCJhcHBpZCI6IjIzNGUyZmUxLWE4MmMtNGRmMy1hOTM1LTY4ZTk0MTUxMDhiOSIsImFwcGlkYWNyIjoiMSIsImRldmljZWlkIjoiNDY5NWFkMDQtODBiMy00YTRjLWE3ZjYtNDRhYmRlOTA3MTAzIiwiZmFtaWx5X25hbWUiOiJOYWlkdSIsImdpdmVuX25hbWUiOiJWYXNhbnRoaSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjE3MS42MS4yNDUuMjA1IiwibmFtZSI6IlZhc2FudGhpIE5haWR1Iiwib2lkIjoiMmIyNDY0ZDEtMDU0Ni00ZTUyLWI5YzgtZDRlM2Y5NTMyNzg0IiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDA0Qzg0MEE1MkQiLCJyaCI6IjEuQVVrQVBfbDNhTzBXVTB5OE9JY3dJbExnUkFNQUFBQUFBQUFBd0FBQUFBQUFBQUFvQVdaSkFBLiIsInNjcCI6ImVtYWlsIG9wZW5pZCBwcm9maWxlIFVzZXIuUmVhZCIsInNpZCI6IjAwN2U1ZmE5LTNlNTQtMTEwOC0zODZmLTllNjIyY2VmYzFlNyIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjBRdUFUOU9rbnZSTUhkNzRkWU5qMlVDX1U5UHdxUW40SVFOQzhEeUF1WEkiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiI2ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQiLCJ1bmlxdWVfbmFtZSI6InZhc2FudGhpQGZkZXN0ZWNoLmNvbSIsInVwbiI6InZhc2FudGhpQGZkZXN0ZWNoLmNvbSIsInV0aSI6IjVWQUhOSlgtRDBXa21mZjdUSWtnQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfZnRkIjoiMVlHeEFwS1ZjY3BjT2cwbXRyYzZNTTAzMnIzTFB3TmtCd3AtVFJjbmkzb0JhMjl5WldGemIzVjBhQzFrYzIxeiIsInhtc19pZHJlbCI6IjEgNCIsInhtc19zdCI6eyJzdWIiOiJXZVBXanNKS1p0SzdWSXhzT3RwV19HN0VHTEdBZVR5d21NYWZCWUx5WmNVIn0sInhtc190Y2R0IjoxNTc5MDIxNjgwfQ.LXMFpDkeAMVsn_rzHhJPCjX_GyJ-kx0Inhv7BKMoX7_Ml3zQs3MwGKRMJTEZ5oPuuVUmuHf9gcjW2aeoMMZpnnPgxgRZgpVbi3xMWAaR5R5zSAuu4OqMAAcORvh4b3eVts037j9ueDNEVLOyknJrnIFS1LzIMpR2MHebHfEMsOah15_vwvgiEdme_sT0ftX-qbWpxe94oagRuABYgRC75MTHGD9VyeEnSrA2Jx6SnsFlkVNF7MBvkBoKvBxzLiNJtCGCvyMjtUczOoE2iaHJ9VEM2Snx9G-DXP_ClwICR5CqVUniDEyruo0M-N80DWGRwr7gJmCL0oBlAm2v9r3nzQ","idToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiIyMzRlMmZlMS1hODJjLTRkZjMtYTkzNS02OGU5NDE1MTA4YjkiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNjg3N2Y5M2YtMTZlZC00YzUzLWJjMzgtODczMDIyNTJlMDQ0L3YyLjAiLCJpYXQiOjE3NTgxMDYwMTUsIm5iZiI6MTc1ODEwNjAxNSwiZXhwIjoxNzU4MTA5OTE1LCJuYW1lIjoiVmFzYW50aGkgTmFpZHUiLCJvaWQiOiIyYjI0NjRkMS0wNTQ2LTRlNTItYjljOC1kNGUzZjk1MzI3ODQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ2YXNhbnRoaUBmZGVzdGVjaC5jb20iLCJyaCI6IjEuQVVrQVBfbDNhTzBXVTB5OE9JY3dJbExnUk9FdlRpTXNxUE5OcVRWbzZVRlJDTGtvQVdaSkFBLiIsInNpZCI6IjAwN2U1ZmE5LTNlNTQtMTEwOC0zODZmLTllNjIyY2VmYzFlNyIsInN1YiI6IldlUFdqc0pLWnRLN1ZJeHNPdHBXX0c3RUdMR0FlVHl3bU1hZkJZTHlaY1UiLCJ0aWQiOiI2ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQiLCJ1dGkiOiI1VkFITkpYLUQwV2ttZmY3VElrZ0FBIiwidmVyIjoiMi4wIn0.nshE5gpzo5BQxVNOO99fTMhs8UnhXf5gHvnVndlY5Qa1PQrjjsv7kBvXg92aOQiL_CbsiyG12sUolknI7QK3rBN1Vu_TxAsnGiMzPHMOX56lcGC5x_m6vMfZ9XRjqqlmFJt2x2s8cJBQeb6UkKv9zJIeO8YKdSLmsGmlBRAFYbMnlonrNOknpz4LzQs6x8IxAnPM6gXnCmzToP6-LUS70i6MXkNaBgMteIL8hKIy4nU4maeT2wzNvbMBqFhIKKnfE9eNA1tHhEoKq_y2HhI9Ej3Sw2ShlnDmt5y6iH5EXfgBF5pIKz2eZh-Dc2rO25DDZ-sO4JaiM0pZEsRxJNundA","account":{"homeAccountId":"2b2464d1-0546-4e52-b9c8-d4e3f9532784.6877f93f-16ed-4c53-bc38-87302252e044","environment":"login.windows.net","tenantId":"6877f93f-16ed-4c53-bc38-87302252e044","username":"vasanthi@fdestech.com","localAccountId":"2b2464d1-0546-4e52-b9c8-d4e3f9532784","name":"Vasanthi Naidu","authorityType":"MSSTS","tenantProfiles":{},"idTokenClaims":{"aud":"234e2fe1-a82c-4df3-a935-68e9415108b9","iss":"https://login.microsoftonline.com/6877f93f-16ed-4c53-bc38-87302252e044/v2.0","iat":1758106015,"nbf":1758106015,"exp":1758109915,"name":"Vasanthi Naidu","oid":"2b2464d1-0546-4e52-b9c8-d4e3f9532784","preferred_username":"vasanthi@fdestech.com","rh":"1.AUkAP_l3aO0WU0y8OIcwIlLgROEvTiMsqPNNqTVo6UFRCLkoAWZJAA.","sid":"007e5fa9-3e54-1108-386f-9e622cefc1e7","sub":"WePWjsJKZtK7VIxsOtpW_G7EGLGAeTywmMafBYLyZcU","tid":"6877f93f-16ed-4c53-bc38-87302252e044","uti":"5VAHNJX-D0Wkmff7TIkgAA","ver":"2.0"},"idToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiIyMzRlMmZlMS1hODJjLTRkZjMtYTkzNS02OGU5NDE1MTA4YjkiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNjg3N2Y5M2YtMTZlZC00YzUzLWJjMzgtODczMDIyNTJlMDQ0L3YyLjAiLCJpYXQiOjE3NTgxMDYwMTUsIm5iZiI6MTc1ODEwNjAxNSwiZXhwIjoxNzU4MTA5OTE1LCJuYW1lIjoiVmFzYW50aGkgTmFpZHUiLCJvaWQiOiIyYjI0NjRkMS0wNTQ2LTRlNTItYjljOC1kNGUzZjk1MzI3ODQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ2YXNhbnRoaUBmZGVzdGVjaC5jb20iLCJyaCI6IjEuQVVrQVBfbDNhTzBXVTB5OE9JY3dJbExnUk9FdlRpTXNxUE5OcVRWbzZVRlJDTGtvQVdaSkFBLiIsInNpZCI6IjAwN2U1ZmE5LTNlNTQtMTEwOC0zODZmLTllNjIyY2VmYzFlNyIsInN1YiI6IldlUFdqc0pLWnRLN1ZJeHNPdHBXX0c3RUdMR0FlVHl3bU1hZkJZTHlaY1UiLCJ0aWQiOiI2ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQiLCJ1dGkiOiI1VkFITkpYLUQwV2ttZmY3VElrZ0FBIiwidmVyIjoiMi4wIn0.nshE5gpzo5BQxVNOO99fTMhs8UnhXf5gHvnVndlY5Qa1PQrjjsv7kBvXg92aOQiL_CbsiyG12sUolknI7QK3rBN1Vu_TxAsnGiMzPHMOX56lcGC5x_m6vMfZ9XRjqqlmFJt2x2s8cJBQeb6UkKv9zJIeO8YKdSLmsGmlBRAFYbMnlonrNOknpz4LzQs6x8IxAnPM6gXnCmzToP6-LUS70i6MXkNaBgMteIL8hKIy4nU4maeT2wzNvbMBqFhIKKnfE9eNA1tHhEoKq_y2HhI9Ej3Sw2ShlnDmt5y6iH5EXfgBF5pIKz2eZh-Dc2rO25DDZ-sO4JaiM0pZEsRxJNundA"},"isAuthenticated":true,"user":{"id":"9fb4c695-62da-4d3d-8b5c-159e3d4448fd","email":"vasanthi@fdestech.com","name":"Vasanthi Naidu","role":"user","azureObjectId":"2b2464d1-0546-4e52-b9c8-d4e3f9532784","isActive":1,"lastLoginAt":null,"createdAt":"2025-09-17T10:47:43.305Z","updatedAt":"2025-09-17T10:51:59.423Z"}}	2025-09-19 08:29:11
ZuLQLXI5H0ImykJLd8o_zbzf4npEf7w3	{"cookie":{"originalMaxAge":86400000,"expires":"2025-09-18T12:55:02.210Z","secure":false,"httpOnly":true,"path":"/"},"accessToken":"eyJ0eXAiOiJKV1QiLCJub25jZSI6Ikg2T01XcXZkaWw4ZmlqcWhITVR3VDN0R1ZhOWhtYjNOXzdjVGlRSEQyU2siLCJhbGciOiJSUzI1NiIsIng1dCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQvIiwiaWF0IjoxNzU4MTEzNDAxLCJuYmYiOjE3NTgxMTM0MDEsImV4cCI6MTc1ODExODQ0OCwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQWRRQUsvOFpBQUFBV0hDM1NpTnZIQlFiNzZKQnI3cGhUSzFobHlHRldZalkrQjB3YjhGQlFiZ2x2Y3BrRWVXQmtTa0ZNWmU3YXlqZzB3a0oyUVVUL2pncW5kVER3ODNtZG5KNHBrbzV4YUZsbnhrMVBjWjlTUkJtMVRBWk13aGZnRlBuTFJuT3VyVFRYWXRnMHFQS1ExaVhkaHRtazNqRDNsYmwyRDh3c1NJOEtsT3ZZdnFWWUw3MXhGa05JUDBlTEZ4M251WTM1S0x1QmU1Q2V3cXdaaG1xQ2kzZkdnQ1VJZWhrRkR4U1prZmk5eEFkTGdzMUVzZzBlOGM5MU05NWVPRktUZk4vNG8zRWFKS1lCMm1GdjY0dmIyUk1Ta0hXTlE9PSIsImFtciI6WyJyc2EiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRkRFUy1Qb3J0YWwiLCJhcHBpZCI6IjIzNGUyZmUxLWE4MmMtNGRmMy1hOTM1LTY4ZTk0MTUxMDhiOSIsImFwcGlkYWNyIjoiMSIsImRldmljZWlkIjoiNDNmYmJiMGUtMTNiOS00ZmM2LWI2MjQtMDQ5NGM5YWJkMzMzIiwiZmFtaWx5X25hbWUiOiJNZWRhcGF0aSIsImdpdmVuX25hbWUiOiJOYXZhbGlrYSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjE3MS42MS4yNDUuMjA1IiwibmFtZSI6Ik5hdmFsaWthIiwib2lkIjoiOTY2NDMyNWEtMWU5Mi00NTM3LWIyZDYtNTg4OTkxZGJmNDVjIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDAzNEIyRkJBMUQiLCJyaCI6IjEuQVVrQVBfbDNhTzBXVTB5OE9JY3dJbExnUkFNQUFBQUFBQUFBd0FBQUFBQUFBQUFvQVNOSkFBLiIsInNjcCI6ImVtYWlsIG9wZW5pZCBwcm9maWxlIFVzZXIuUmVhZCIsInNpZCI6IjAwN2FiNjI5LTcxNzQtMDc1Mi00ZGMxLTFmZmUwZmM1ZDkwZiIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6Im1nd05DZWx1NldZX3RPX280Y29LNmJIYVpYbUdOeXg2eDkzakZKRndxY0UiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiI2ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQiLCJ1bmlxdWVfbmFtZSI6Im5hdmFsaWthQGZkZXN0ZWNoLmNvbSIsInVwbiI6Im5hdmFsaWthQGZkZXN0ZWNoLmNvbSIsInV0aSI6ImVzM3h2clM3cEUtSElxVjlMS1l4QUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfZnRkIjoiOUFBT3ljOWhpRTJMUk4wYXRoakJYaVdDVlZfR3VwOEJzazlNckNJdEtoOEJhbUZ3WVc1bFlYTjBMV1J6YlhNIiwieG1zX2lkcmVsIjoiMSAzMCIsInhtc19zdCI6eyJzdWIiOiJQdXh3ZUV3QXRTbXNOXzlwRzFfWGUxMk81NC1raG54U08xbFg0SkMycnVvIn0sInhtc190Y2R0IjoxNTc5MDIxNjgwfQ.DrFiLWNefj7cEudSUvDkBEJ--0SmMyKUcoWqonuEveSvvYvoN-P2hnITlZfEhhYYBrkW3V4dbAK1v2jKPdsGnTA3wF3tLCn8baunkqSzBnOwyUqwxSa0yd88bz7mX53GgOw1Go1VQ8M8NWMpkC1s1cswXIG0xZrrNB-en1BR_sIrtnO5HPDilFtDsMrX3C9rRYXQpd9QM15L8D947xP65eipgg4ugHgRrVMVp1QDWccNxtYqVJoNEPMnL0EP0mACCJ2JuhwWxqSFz1z8FK8gcc1cnmL_yHW4LqAj_r5tNxAFlBp6gYCrQOVYpayV4Nq7nUxoAuTz3XIUqg1WKkZybg","idToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiIyMzRlMmZlMS1hODJjLTRkZjMtYTkzNS02OGU5NDE1MTA4YjkiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNjg3N2Y5M2YtMTZlZC00YzUzLWJjMzgtODczMDIyNTJlMDQ0L3YyLjAiLCJpYXQiOjE3NTgxMTM0MDEsIm5iZiI6MTc1ODExMzQwMSwiZXhwIjoxNzU4MTE3MzAxLCJuYW1lIjoiTmF2YWxpa2EiLCJvaWQiOiI5NjY0MzI1YS0xZTkyLTQ1MzctYjJkNi01ODg5OTFkYmY0NWMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJuYXZhbGlrYUBmZGVzdGVjaC5jb20iLCJyaCI6IjEuQVVrQVBfbDNhTzBXVTB5OE9JY3dJbExnUk9FdlRpTXNxUE5OcVRWbzZVRlJDTGtvQVNOSkFBLiIsInNpZCI6IjAwN2FiNjI5LTcxNzQtMDc1Mi00ZGMxLTFmZmUwZmM1ZDkwZiIsInN1YiI6IlB1eHdlRXdBdFNtc05fOXBHMV9YZTEyTzU0LWtobnhTTzFsWDRKQzJydW8iLCJ0aWQiOiI2ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQiLCJ1dGkiOiJlczN4dnJTN3BFLUhJcVY5TEtZeEFBIiwidmVyIjoiMi4wIn0.cei7H8cWA8Q9hDaIyEoIH1dFbTinaVrtkf1s_KFQneFeJrj1lnE215L-ob3Mckq95q-KheWKwjropIQfofPY6zYpHEg-iHFqvBTmXU1_pUJpmPUkE1oDFdqv-glpw2i4je3d3G6Py156fGKbavNmTWwkm14qTSRXlL5T5-Qcv-ypneeqbU73sV7VXIvkS1LQWFGIjAufPfs2B246qewRzIhTloXtuU1A5WfFqI3-c6CPDK7nQNyx9n7v8tIufjj4OAcHkd0PPYPZqi9sEkfABPbRhOLG7rZHaD7pOVURjDAfOdqW8GiIFKwF7lD57_eiKy3beMcsZAssjm-S6KCdTQ","account":{"homeAccountId":"9664325a-1e92-4537-b2d6-588991dbf45c.6877f93f-16ed-4c53-bc38-87302252e044","environment":"login.windows.net","tenantId":"6877f93f-16ed-4c53-bc38-87302252e044","username":"navalika@fdestech.com","localAccountId":"9664325a-1e92-4537-b2d6-588991dbf45c","name":"Navalika","authorityType":"MSSTS","tenantProfiles":{},"idTokenClaims":{"aud":"234e2fe1-a82c-4df3-a935-68e9415108b9","iss":"https://login.microsoftonline.com/6877f93f-16ed-4c53-bc38-87302252e044/v2.0","iat":1758113401,"nbf":1758113401,"exp":1758117301,"name":"Navalika","oid":"9664325a-1e92-4537-b2d6-588991dbf45c","preferred_username":"navalika@fdestech.com","rh":"1.AUkAP_l3aO0WU0y8OIcwIlLgROEvTiMsqPNNqTVo6UFRCLkoASNJAA.","sid":"007ab629-7174-0752-4dc1-1ffe0fc5d90f","sub":"PuxweEwAtSmsN_9pG1_Xe12O54-khnxSO1lX4JC2ruo","tid":"6877f93f-16ed-4c53-bc38-87302252e044","uti":"es3xvrS7pE-HIqV9LKYxAA","ver":"2.0"},"idToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiIyMzRlMmZlMS1hODJjLTRkZjMtYTkzNS02OGU5NDE1MTA4YjkiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNjg3N2Y5M2YtMTZlZC00YzUzLWJjMzgtODczMDIyNTJlMDQ0L3YyLjAiLCJpYXQiOjE3NTgxMTM0MDEsIm5iZiI6MTc1ODExMzQwMSwiZXhwIjoxNzU4MTE3MzAxLCJuYW1lIjoiTmF2YWxpa2EiLCJvaWQiOiI5NjY0MzI1YS0xZTkyLTQ1MzctYjJkNi01ODg5OTFkYmY0NWMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJuYXZhbGlrYUBmZGVzdGVjaC5jb20iLCJyaCI6IjEuQVVrQVBfbDNhTzBXVTB5OE9JY3dJbExnUk9FdlRpTXNxUE5OcVRWbzZVRlJDTGtvQVNOSkFBLiIsInNpZCI6IjAwN2FiNjI5LTcxNzQtMDc1Mi00ZGMxLTFmZmUwZmM1ZDkwZiIsInN1YiI6IlB1eHdlRXdBdFNtc05fOXBHMV9YZTEyTzU0LWtobnhTTzFsWDRKQzJydW8iLCJ0aWQiOiI2ODc3ZjkzZi0xNmVkLTRjNTMtYmMzOC04NzMwMjI1MmUwNDQiLCJ1dGkiOiJlczN4dnJTN3BFLUhJcVY5TEtZeEFBIiwidmVyIjoiMi4wIn0.cei7H8cWA8Q9hDaIyEoIH1dFbTinaVrtkf1s_KFQneFeJrj1lnE215L-ob3Mckq95q-KheWKwjropIQfofPY6zYpHEg-iHFqvBTmXU1_pUJpmPUkE1oDFdqv-glpw2i4je3d3G6Py156fGKbavNmTWwkm14qTSRXlL5T5-Qcv-ypneeqbU73sV7VXIvkS1LQWFGIjAufPfs2B246qewRzIhTloXtuU1A5WfFqI3-c6CPDK7nQNyx9n7v8tIufjj4OAcHkd0PPYPZqi9sEkfABPbRhOLG7rZHaD7pOVURjDAfOdqW8GiIFKwF7lD57_eiKy3beMcsZAssjm-S6KCdTQ"},"isAuthenticated":true,"user":{"id":"95767f99-7bf7-4f9b-a7dc-bab03c67f43c","email":"navalika@fdestech.com","name":"Navalika","role":"admin","azureObjectId":"9664325a-1e92-4537-b2d6-588991dbf45c","isActive":1,"lastLoginAt":"2025-09-17T12:49:43.275Z","createdAt":"2025-09-17T09:50:00.737Z","updatedAt":"2025-09-17T12:49:43.275Z"}}	2025-09-19 08:28:35
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, name, role, azure_object_id, is_active, last_login_at, created_at, updated_at) FROM stdin;
9fb4c695-62da-4d3d-8b5c-159e3d4448fd	vasanthi@fdestech.com	Vasanthi Naidu	user	2b2464d1-0546-4e52-b9c8-d4e3f9532784	1	2025-09-17 10:51:59.484	2025-09-17 10:47:43.305	2025-09-17 10:51:59.484
203cc278-1467-4c20-aa83-3f0cd052c87f	nag@fdestech.com	Nagarjuna Reddy Kora	admin	3e39af88-a840-4af5-b05b-338b0379c7be	1	2025-09-17 11:11:52.412	2025-09-17 11:01:16.144	2025-09-17 11:11:52.412
95767f99-7bf7-4f9b-a7dc-bab03c67f43c	navalika@fdestech.com	Navalika	admin	9664325a-1e92-4537-b2d6-588991dbf45c	1	2025-09-17 12:55:02.163	2025-09-17 09:50:00.737803	2025-09-17 12:55:02.163
\.


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: expense_wallets expense_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_wallets
    ADD CONSTRAINT expense_wallets_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_azure_object_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_azure_object_id_unique UNIQUE (azure_object_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: expenses expenses_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

