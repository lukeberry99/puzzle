import { Button } from "@/components/ui/button";
import { SaveIcon, TableIcon } from "lucide-react";
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

export default function Create() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authorName: "",
      timeLimit: "unlimited",
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

    await fetch("http://localhost:8181/game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    window.location.href = "/";
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Connections</h1>
          <Button asChild>
            <a href="/">
              <TableIcon /> List
            </a>
          </Button>
        </header>
      </div>

      <div className="container mx-auto mb-8 px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Time limit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="impossible">Impossible</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <hr />

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Group {["A", "B", "C", "D"][index]}
                </h3>
                {[0, 1, 2, 3].map((tileIndex) => (
                  <FormField
                    key={`${field.id}-tile-${tileIndex}`}
                    control={form.control}
                    name={`groups.${index}.tiles.${tileIndex}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tile {tileIndex + 1}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <FormField
                  control={form.control}
                  name={`groups.${index}.link`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>The Link</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        What connects these things together?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button type="submit">
              <SaveIcon />
              Create
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
