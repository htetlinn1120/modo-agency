"use client";
import React from "react";
import Link from "next/link";
import { defaultArticles, type Article } from "../content";
import { insightCategories } from "../data";

export default function InsightsPage(){
 const [articles,setArticles]=React.useState<Article[]>(defaultArticles); const [cat,setCat]=React.useState("All");
 React.useEffect(()=>{try{const v=localStorage.getItem("modo-articles");if(v)setArticles(JSON.parse(v))}catch{}} ,[]);
 const published=articles.filter((a:any)=>a.status!=="draft");
 const shown=cat==="All"?published:published.filter(a=>a.category===cat);
 return <main className="min-h-screen bg-[#0a0a0a] text-white"><header className="border-b border-white/10 px-6 py-7 md:px-10"><div className="mx-auto flex max-w-[1400px] items-center justify-between"><Link href="/"><img src="/modo-logo.png" className="w-24" alt="MODO"/></Link><Link href="/admin" className="text-xs text-neutral-500 hover:text-white">Admin ↗</Link></div></header><section className="px-6 py-24 md:px-10 md:py-36"><div className="mx-auto max-w-[1400px]"><p className="text-xs uppercase tracking-[.25em] text-neutral-500">MODO Insights</p><h1 className="mt-7 text-6xl font-medium tracking-[-.06em] md:text-8xl">Ideas worth sharing.</h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-500">Thinking on branding, digital marketing, graphic design, social media, copywriting and creative work.</p><div className="mt-14 flex flex-wrap gap-2">{["All",...insightCategories].map(x=><button key={x} onClick={()=>setCat(x)} className={`rounded-full border px-4 py-2 text-xs ${cat===x?"border-white bg-white text-black":"border-white/15 text-neutral-400 hover:border-white/40"}`}>{x}</button>)}</div><div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{shown.map(a=><Link key={a.slug} href={`/insights/${a.slug}`} className="group border-t border-white/10 pt-6"><div className="flex justify-between text-xs text-neutral-600"><span>{a.category}</span><span>{a.readTime}</span></div><h2 className="mt-10 text-3xl leading-tight tracking-[-.035em] group-hover:text-neutral-300">{a.title}</h2><p className="mt-5 leading-relaxed text-neutral-500">{a.excerpt}</p><p className="mt-7 text-xs text-neutral-700">{a.date}</p></Link>)}</div></div></section></main>
}
