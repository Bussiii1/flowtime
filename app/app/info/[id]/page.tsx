import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function InfoDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: page } = await supabase
    .from('info_pages')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!page) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 bg-background/80 p-4 backdrop-blur-md border-b flex items-center gap-4">
        <Link href="/app/info">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold truncate">{page.title}</h1>
      </header>

      <main className="flex-1 p-6 prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-3xl font-black mb-4 text-primary" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b-2 border-secondary/20 pb-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
            li: ({ node, ...props }) => <li className="text-slate-700 dark:text-slate-300" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
          }}
        >
          {page.content}
        </ReactMarkdown>
      </main>

      <footer className="p-8 text-center text-xs text-muted-foreground bg-muted/20 mt-auto">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </footer>
    </div>
  )
}
