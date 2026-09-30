export type Role = 'root' | 'child';

export type RegistryEntry = {
  dir: string;
  role: Role;
  label?: string;
};

/** Sessions of this process that currently use a scratchpad, keyed by session file (or `mem:<id>`). */
export class Registry {
  private readonly entries = new Map<string, RegistryEntry>();

  register(key: string, entry: RegistryEntry): void {
    this.entries.set(key, entry);
  }

  unregister(key: string): void {
    this.entries.delete(key);
  }

  get(key: string): RegistryEntry | undefined {
    return this.entries.get(key);
  }

  activeRootKeys(): string[] {
    return [...this.entries].filter(([, entry]) => entry.role === 'root').map(([key]) => key);
  }

  activeDirs(): Set<string> {
    return new Set([...this.entries.values()].map(entry => entry.dir));
  }
}
