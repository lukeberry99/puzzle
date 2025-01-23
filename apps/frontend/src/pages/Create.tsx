import { Button } from "@/components/ui/button";
import { LayoutGrid, SaveIcon, TableIcon } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const groupSchema = z.object({
  tiles: z.array(z.string().min(1, "Tile cannot be empty")).length(4),
  link: z.string().min(1, "Link cannot be empty"),
  linkingTerms: z.optional(z.string()),
});

const formSchema = z.object({
  authorName: z.string().min(2, "Author name must be at least 2 characters"),
  timeLimit: z.enum(["unlimited", "15", "10", "5"]),
  difficulty: z.enum(["easy", "medium", "hard", "impossible"]),
  groups: z.array(groupSchema).length(4),
});
interface GroupProps {
  label: string;
  groupNumber: number;
}
function Group({
  label,
  groupNumber,
  form,
  index,
}: GroupProps & { form: any; index: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Group {label}</h3>
        <span className="text-sm text-muted-foreground">#{groupNumber}/4</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((tileIndex) => (
          <div key={tileIndex} className="space-y-2">
            <Label htmlFor={`group-${label}-tile-${tileIndex + 1}`}>
              Tile {tileIndex + 1}
            </Label>
            <Input
              id={`group-${label}-tile-${tileIndex + 1}`}
              placeholder="Enter word or phrase"
              {...form.register(`groups.${index}.tiles.${tileIndex}`)}
            />
            {form.formState.errors.groups?.[index]?.tiles?.[tileIndex] && (
              <p className="text-sm text-red-500">
                {form.formState.errors.groups[index].tiles[tileIndex].message}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`group-${label}-link`}>The Link</Label>
        <Input
          id={`group-${label}-link`}
          placeholder="What connects these words?"
          className="w-full"
          {...form.register(`groups.${index}.link`)}
        />
        {form.formState.errors.groups?.[index]?.link && (
          <p className="text-sm text-red-500">
            {form.formState.errors.groups[index].link.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Create() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authorName: "",
      timeLimit: "unlimited", // This will always be unlimited now
      difficulty: "medium",
      groups: [
        { tiles: ["", "", "", ""], link: "", linkingTerms: "" },
        { tiles: ["", "", "", ""], link: "", linkingTerms: "" },
        { tiles: ["", "", "", ""], link: "", linkingTerms: "" },
        { tiles: ["", "", "", ""], link: "", linkingTerms: "" },
      ],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "groups",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      author: values.authorName,
      difficulty: values.difficulty,
      time_limit: values.timeLimit,
      groups: values.groups.map((g) => ({
        tiles: g.tiles.map((title) => ({ title })),
        link: g.link,
        linking_terms: "",
      })),
    };

    await fetch("https://connections.lberry.dev/api/game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    window.location.href = "/";
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card className="backdrop-blur-xl bg-white/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Create Connection
                </CardTitle>
                <CardDescription>
                  Create a new connections puzzle for others to solve
                </CardDescription>
              </div>
              <Button variant="outline" size="icon" className="rounded-full">
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  {...form.register("authorName")}
                />
                {form.formState.errors.authorName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.authorName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("difficulty", value as any)
                    }
                    defaultValue={form.getValues("difficulty")}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="impossible">Impossible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-limit" className="text-muted-foreground">
                    Time Limit
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("timeLimit", value as any)
                    }
                    defaultValue="unlimited"
                    disabled
                  >
                    <SelectTrigger id="time-limit">
                      <SelectValue>Unlimited</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {fields.map((field, index) => (
                <Group
                  key={field.id}
                  label={["A", "B", "C", "D"][index]}
                  groupNumber={index + 1}
                  form={form}
                  index={index}
                />
              ))}

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => (window.location.href = "/")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Create Puzzle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  //<>
  //  <div className="container mx-auto px-4 py-8">
  //    <header className="flex justify-between items-center mb-8">
  //      <h1 className="text-2xl font-bold">Connections</h1>
  //      <Button asChild>
  //        <a href="/">
  //          <TableIcon /> List
  //        </a>
  //      </Button>
  //    </header>
  //  </div>
  //
  //  <div className="container mx-auto mb-8 px-4 py-8">
  //    <Form {...form}>
  //      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
  //        <FormField
  //          control={form.control}
  //          name="authorName"
  //          render={({ field }) => (
  //            <FormItem>
  //              <FormLabel>Author Name</FormLabel>
  //              <FormControl>
  //                <Input placeholder="Your name" {...field} />
  //              </FormControl>
  //            </FormItem>
  //          )}
  //        />
  //
  //        <FormField
  //          control={form.control}
  //          name="timeLimit"
  //          render={({ field }) => (
  //            <FormItem>
  //              <FormLabel>Time Limit</FormLabel>
  //              <Select
  //                onValueChange={field.onChange}
  //                defaultValue={field.value}
  //              >
  //                <FormControl>
  //                  <SelectTrigger>
  //                    <SelectValue placeholder="Time limit" />
  //                  </SelectTrigger>
  //                </FormControl>
  //                <SelectContent>
  //                  <SelectItem value="unlimited">Unlimited</SelectItem>
  //                  <SelectItem value="15">15 minutes</SelectItem>
  //                  <SelectItem value="10">10 minutes</SelectItem>
  //                  <SelectItem value="5">5 minutes</SelectItem>
  //                </SelectContent>
  //              </Select>
  //            </FormItem>
  //          )}
  //        />
  //
  //        <FormField
  //          control={form.control}
  //          name="difficulty"
  //          render={({ field }) => (
  //            <FormItem>
  //              <FormLabel>Difficulty</FormLabel>
  //              <Select
  //                onValueChange={field.onChange}
  //                defaultValue={field.value}
  //              >
  //                <FormControl>
  //                  <SelectTrigger>
  //                    <SelectValue placeholder="Difficulty" />
  //                  </SelectTrigger>
  //                </FormControl>
  //                <SelectContent>
  //                  <SelectItem value="easy">Easy</SelectItem>
  //                  <SelectItem value="medium">Medium</SelectItem>
  //                  <SelectItem value="hard">Hard</SelectItem>
  //                  <SelectItem value="impossible">Impossible</SelectItem>
  //                </SelectContent>
  //              </Select>
  //            </FormItem>
  //          )}
  //        />
  //        <hr />
  //
  //        {fields.map((field, index) => (
  //          <div key={field.id} className="space-y-4">
  //            <h3 className="text-lg font-semibold">
  //              Group {["A", "B", "C", "D"][index]}
  //            </h3>
  //            {[0, 1, 2, 3].map((tileIndex) => (
  //              <FormField
  //                key={`${field.id}-tile-${tileIndex}`}
  //                control={form.control}
  //                name={`groups.${index}.tiles.${tileIndex}`}
  //                render={({ field }) => (
  //                  <FormItem>
  //                    <FormLabel>Tile {tileIndex + 1}</FormLabel>
  //                    <FormControl>
  //                      <Input {...field} />
  //                    </FormControl>
  //                    <FormMessage />
  //                  </FormItem>
  //                )}
  //              />
  //            ))}
  //            <FormField
  //              control={form.control}
  //              name={`groups.${index}.link`}
  //              render={({ field }) => (
  //                <FormItem>
  //                  <FormLabel>The Link</FormLabel>
  //                  <FormControl>
  //                    <Input {...field} />
  //                  </FormControl>
  //                  <FormDescription>
  //                    What connects these things together?
  //                  </FormDescription>
  //                  <FormMessage />
  //                </FormItem>
  //              )}
  //            />
  //          </div>
  //        ))}
  //
  //        <Button type="submit">
  //          <SaveIcon />
  //          Create
  //        </Button>
  //      </form>
  //    </Form>
  //  </div>
  //</>
  //);
}
