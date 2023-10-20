import React, { PropsWithChildren } from "react";

const PageLayout = (props: PropsWithChildren<{}>) => {
  return (
    <main className="overflow-none flex h-screen justify-center">
      <div className="feed flex h-full w-full flex-col overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};

export default PageLayout;
