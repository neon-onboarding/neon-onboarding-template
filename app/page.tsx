import db from "@/db";
import { todosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PAGE_TITLE } from "./page-title";

const addTodo = async (formData: FormData) => {
  "use server";
  const title = formData.get("title")?.toString();
  if (!title) return;
  await db.insert(todosTable).values({ title }).returning();
  revalidatePath(".");
};

const removeTodo = async (id: string) => {
  "use server";
  await db.delete(todosTable).where(eq(todosTable.id, id));
  revalidatePath(".");
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const todos = await db
    .select()
    .from(todosTable)
    .orderBy(todosTable.created_at);

  const isPreview = !!process.env.NEXT_PUBLIC_GITHUB_PULL_NUMBER;

  const codeLocation = isPreview
    ? `github.com/${process.env.NEXT_PUBLIC_GITHUB_REPOSITORY}/tree/${process.env.NEXT_PUBLIC_GITHUB_REF}`
    : `github.com/${process.env.NEXT_PUBLIC_GITHUB_REPOSITORY}`;

  return (
    <div className="min-h-screen flex flex-col gap-8 p-4 md:py-12 justify-center max-w-screen-md mx-auto">
      <div className="self-center">
        <div className="text-center text-5xl mb-4">🎉</div>
        <div className="text-center text-5xl mb-8 tracking-tighter font-bold">
          {PAGE_TITLE}
        </div>
        <div className="my-2 font-bold">
          This is your own fully functional todo app hosted on Vercel backed by
          your Neon database.
        </div>
        <div className="my-2 text-sm">
          It has a GitHub Actions CI/CD setup to automatically deploy the
          &quot;production&quot; version from the main branch, and a
          &quot;preview&quot; version from every pull request.
        </div>
        <div className="my-2 text-sm">
          The code is here:{" "}
          <a
            href={`https://${codeLocation}`}
            target="_blank"
            className="font-mono text-xs underline text-green-600"
          >
            {codeLocation}
          </a>
        </div>
        <div className="my-2">
          — <br />
          This is{" "}
          {isPreview ? (
            <span>
              a &quot;preview&quot; version for{" "}
              <a
                href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPOSITORY}/pull/${process.env.NEXT_PUBLIC_GITHUB_PULL_NUMBER}`}
                target="_blank"
                className="underline"
              >
                pull request #{process.env.NEXT_PUBLIC_GITHUB_PULL_NUMBER}
              </a>
            </span>
          ) : (
            'the "production" version'
          )}
          . It uses:
          <ul className="ml-2 mt-2 list-disc list-inside text-sm leading-loose">
            <li>
              the{" "}
              <span className="font-mono text-xs px-2 py-1 mx-1 bg-gray-400/40 rounded-full">
                {process.env.NEXT_PUBLIC_GITHUB_REF}
              </span>{" "}
              branch of the git repo
            </li>
            <li>
              the{" "}
              <span className="font-mono text-xs px-2 py-1 mx-1 bg-gray-400/40 rounded-full">
                {process.env.NEXT_PUBLIC_NEON_BRANCH}
              </span>{" "}
              branch of your database
            </li>
          </ul>
        </div>

        <div className="my-2">
          — <br />
          <div>Now, your move:</div>
          <ol className="ml-6 mt-2 list-decimal list-outside text-sm">
            {isPreview ? (
              <>
                <li className="mb-2">
                  See that the title ({PAGE_TITLE}) has changed. But the to-dos
                  below are the same that were in production. This is because
                  this preview branch of your database was created as a fork of
                  production.
                </li>
                <li className="mb-2">
                  Add some more todos below (or remove some), this will be saved
                  in the preview branch of the database.
                  <em> But not in production.</em> (You can check for yourself.)
                </li>
              </>
            ) : (
              <li className="mb-2">
                Add some to-dos first — you&apos;ll see how they&apos;ll also
                appear in your preview deployment. This is because of the
                branching capabilities Neon databases have.
              </li>
            )}
            <li>
              {isPreview
                ? "Use this button to merge the pull request and deploy to production:"
                : "Use this box to create a pull request editing the title of this page:"}
              <form
                action={`${process.env.NEXT_PUBLIC_NEON_ONBOARDING_ORIGIN}/onboarding/${process.env.NEXT_PUBLIC_NEON_ONBOARDING_ID}/pulls`}
                method="post"
                className="inline-flex gap-2 items-baseline ml-2 leading-normal"
              >
                <input
                  type="hidden"
                  name="action"
                  value={isPreview ? "merge" : "open"}
                />
                {isPreview ? (
                  <input
                    type="hidden"
                    name="pullNumber"
                    value={process.env.NEXT_PUBLIC_GITHUB_PULL_NUMBER}
                  />
                ) : (
                  <input
                    placeholder={PAGE_TITLE}
                    required
                    type="text"
                    name="newPageTitle"
                    className="bg-inherit text-inherit rounded border border-gray-500/50 focus:border-foreground outline-none px-2 py-1 flex-1"
                  />
                )}

                <button
                  type="submit"
                  className="font-bold rounded bg-gray-400/40 px-2 py-1"
                >
                  {isPreview ? "Merge" : "Open"} PR
                </button>
                <br />
              </form>
            </li>
            <div className="mt-2 leading-tight opacity-50">
              <em className="text-xs">
                We need you to use this button because the repo is still under
                our GitHub org and GitHub Actions enforces limitations for
                security reasons on &quot;foreign&quot; pull-requests workflows.
              </em>
            </div>
          </ol>
        </div>
      </div>
      <div className="rounded border p-6 border-gray-500/90">
        <h1 className="text-2xl font-bold tracking-tight mb-4">To-dos</h1>
        {todos.length === 0 && (
          <div className="text-xs opacity-60">
            (no to-dos — create one below ⬇️)
          </div>
        )}
        <ul className="list-disc list-inside">
          {todos.map((todo) => (
            <li key={todo.id} className="my-1">
              <span>{todo.title}</span>
              <button
                onClick={removeTodo.bind(null, todo.id)}
                className="float-end text-xs mt-1 opacity-50 px-1"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-bold tracking-tight border-t border-gray-500/50 py-4 mt-8">
          Add to-do
        </h2>
        <form action={addTodo} className="flex gap-3 items-baseline">
          <label htmlFor="title">Title:</label>
          <input
            required
            type="text"
            name="title"
            id="title"
            className="bg-inherit text-inherit rounded border border-gray-500/50 focus:border-foreground outline-none px-3 py-2 flex-1"
          />
          <button
            type="submit"
            className="font-bold rounded bg-gray-400/40 px-3 py-2"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
