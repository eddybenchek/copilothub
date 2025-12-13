'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu, X, Github, LogOut, User, Heart, Folder } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export function SiteHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Search', href: '/search' },
    { name: 'Prompts', href: '/prompts' },
    { name: 'Instructions', href: '/instructions' },
    { name: 'Agents', href: '/agents' },
    { name: 'Tools', href: '/tools' },
    { name: 'MCPs', href: '/mcps' },
    { name: 'Submit', href: '/submit' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        {/* <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">C</span>
          </div>
          <span className="hidden font-bold sm:inline-block">Copilot Directory</span>
        </Link> */}
              <Link href="/" className="flex items-center">
        <Image
          src="/copilothub.svg"
          alt="CopilotHub"
          width={240}
          height={48}
        />
      </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/60 transition-colors duration-150 hover:text-sky-400 border-b-2 border-transparent hover:border-sky-500/60"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {session ? (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{session.user?.name || 'User'}</span>
                </Button>
              }
            >
              <DropdownMenuItem>
                <Link href="/dashboard" className="flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/favorites" className="flex w-full items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/collections" className="flex w-full items-center">
                  <Folder className="mr-2 h-4 w-4" />
                  Collections
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenu>
          ) : (
            <Button variant="primary" size="sm" onClick={() => signIn('github')}>
              <Github className="mr-2 h-4 w-4" />
              Sign in with GitHub
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/favorites"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <Link
                    href="/dashboard/collections"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Collections
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    signIn('github');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
                >
                  Sign in with GitHub
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
