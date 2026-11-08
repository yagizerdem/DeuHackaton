interface FarmShellProps {
  title: string;
  /** buttons shown next to the title */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

// Title row and content of one garden page. The header, tabs and login check
// come from FarmLayout, the parent route.
export default function FarmShell({ title, actions, children }: FarmShellProps) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-stitch-headline text-stitch-headline-lg-mobile text-foreground md:text-stitch-headline-md">
          {title}
        </h1>
        {actions}
      </div>
      {children}
    </>
  );
}
