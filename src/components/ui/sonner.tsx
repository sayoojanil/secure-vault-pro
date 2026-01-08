import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast border shadow-lg bg-background text-foreground",

          description:
            "text-white",

          success:
            "border-green-600 bg-green-600 text-white dark:text-green-400",

          error:
            "border-red-600 bg-red-600 text-white dark:text-green-400",

          actionButton:
            "bg-primary text-primary-foreground",

          cancelButton:
            "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
