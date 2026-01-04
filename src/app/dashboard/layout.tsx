export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed flex max-h-[calc(100vh-65px)] w-full pt-16.25 flex-col">
      <div className="fixed inset-0 bg-linear-to-br from-indigo-500 via-purple-500 to-blue-500 -z-10" />
      {children}
    </div>
  );
}
