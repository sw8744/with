function H1(
  {children}: { children: React.ReactNode }
) {
  return (
    <h1 className={"text-2xl font-bold mt-4"}>
      {children}
    </h1>
  )
}

function H2(
  {children}: { children: React.ReactNode }
) {
  return (
    <h2 className={"text-xl font-semibold mt-4"}>
      {children}
    </h2>
  )
}

function H3(
  {children}: { children: React.ReactNode }
) {
  return (
    <h3 className={"text-lg font-medium mt-4"}>
      {children}
    </h3>
  )
}

export {
  H1,
  H2,
  H3
}
