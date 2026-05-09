'use client'
import React from 'react'
import Link from 'next/link'
import { Logo } from "@/components/brand/logo"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <Logo className="h-10 w-10" textClassName="text-2xl" />
                    <div className="hidden sm:flex items-center gap-4">
                        <Link href="/demo" className="text-sm font-semibold hover:text-primary transition-colors">Démo Interactive</Link>
                        <Link href="/login">
                            <Button className="font-bold rounded-xl shadow-lg shadow-primary/20">Connexion</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="overflow-x-hidden flex-1">
                <section>
                    <div className="pb-24 pt-12 md:pb-32 lg:pb-40 lg:pt-32">
                        <div className="relative mx-auto flex max-w-7xl flex-col px-6 lg:block">
                            <div className="mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left z-10 relative">
                                <Badge variant="outline" className="mb-6 bg-secondary/10 text-secondary border-secondary/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider">
                                    Nouveau Standard HORECA
                                </Badge>
                                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-extrabold md:text-6xl lg:mt-12 xl:text-7xl">
                                    Le pointage <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">simplifié</span>
                                </h1>
                                <p className="mt-8 max-w-xl text-pretty text-lg text-muted-foreground">
                                    FlowTime permet au bar de plage <span className="font-bold text-slate-900 dark:text-white">The Flow</span> de gérer ses équipes avec une efficacité redoutable. Pointage, planning et rentabilité centralisés dans une interface ultra-rapide.
                                </p>

                                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(255,107,107,0.3)] transition-transform hover:scale-105 rounded-2xl">
                                        <Link href="/login">
                                            <span>Accès Staff</span>
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="h-14 border-2 px-8 text-lg font-bold transition-transform hover:scale-105 rounded-2xl bg-white dark:bg-slate-900">
                                        <Link href="/demo">
                                            <span>Essayer la Démo</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Abstract Graphic from 21st.dev */}
                            <img
                                className="pointer-events-none order-first ml-auto h-64 w-full object-cover invert sm:h-96 lg:absolute lg:inset-0 lg:-right-10 lg:-top-20 lg:order-last lg:h-max lg:w-2/3 lg:object-contain dark:mix-blend-lighten dark:invert-0 opacity-80"
                                src="https://ik.imagekit.io/lrigu76hy/tailark/abstract-bg.jpg?updatedAt=1745733473768"
                                alt="Abstract Graphic"
                                height="2000"
                                width="1500"
                            />
                        </div>
                    </div>
                </section>
                
                <section className="bg-slate-50 dark:bg-slate-900/50 py-16 border-y">
                    <div className="group relative m-auto max-w-6xl px-6">
                        <div className="flex flex-col items-center md:flex-row gap-8 md:gap-0">
                            <div className="md:max-w-44 md:border-r md:pr-6">
                                <p className="text-center md:text-end text-sm font-bold text-muted-foreground uppercase tracking-wider">La technologie derrière</p>
                            </div>
                            <div className="relative py-6 w-full md:w-[calc(100%-11rem)]">
                                <InfiniteSlider speedOnHover={20} speed={40} gap={80}>
                                    <div className="flex items-center justify-center font-black text-2xl text-slate-300 dark:text-slate-700 tracking-tighter">NEXT.JS</div>
                                    <div className="flex items-center justify-center font-black text-2xl text-slate-300 dark:text-slate-700 tracking-tighter">REACT</div>
                                    <div className="flex items-center justify-center font-black text-2xl text-slate-300 dark:text-slate-700 tracking-tighter">SUPABASE</div>
                                    <div className="flex items-center justify-center font-black text-2xl text-slate-300 dark:text-slate-700 tracking-tighter">TAILWIND</div>
                                    <div className="flex items-center justify-center font-black text-2xl text-slate-300 dark:text-slate-700 tracking-tighter">VERCEL</div>
                                </InfiniteSlider>
                                <div className="bg-gradient-to-r from-slate-50 dark:from-slate-950 absolute inset-y-0 left-0 w-24"></div>
                                <div className="bg-gradient-to-l from-slate-50 dark:from-slate-950 absolute inset-y-0 right-0 w-24"></div>
                                <ProgressiveBlur className="pointer-events-none absolute left-0 top-0 h-full w-24" direction="left" blurIntensity={1} />
                                <ProgressiveBlur className="pointer-events-none absolute right-0 top-0 h-full w-24" direction="right" blurIntensity={1} />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-auto py-8 w-full text-center text-sm font-medium text-slate-400">
                © {new Date().getFullYear()} FlowTime - The Flow beach bar
            </footer>
        </div>
    )
}
