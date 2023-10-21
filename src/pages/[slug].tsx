import Head from "next/head";
import { api } from "~/utils/api";
import type { GetStaticProps } from "next";
import PageLayout from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

type ProfilePageProps = {
  username: string;
};

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function ProfilePage({ username }: ProfilePageProps) {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Chirp - @{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profilePicture}
            alt={`${data.username ?? "unknown"}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? "unknown"
        }`}</div>
        <div className="w-full border-b border-slate-400" />

        <div className="h-full overflow-y-scroll">
          <ProfileFeed userId={data.id} />
        </div>
      </PageLayout>
    </>
  );
}

// SSG (Static Site Generation) generates the page at build time, allowing it to be cached by the CDN (Content Delivery Network).
// The cached version will be served to all users until the data changes, at which point the page will be regenerated.
// It generally reduces loading time for the users since the page is already generated and cached.
// The function getStaticProps is responsible for fetching the necessary data at build time, which helps with pre-generating the static page.
export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("slug is not a string");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

// This is a fallback page. If the page is not generated at build time, it will be generated at request time.
// This means that if the page has no data cached by the CDN, the page will be generated at request time.
// This may cause a delay in loading time for the user, since the page is not cached
export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
