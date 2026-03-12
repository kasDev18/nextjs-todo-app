import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";
import { BOARD_COLUMNS } from "./constants";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <main className={cn("animate-rise", styles.HomePage)}>
      <section className={styles.HomePage_Board} aria-label="Task board columns">
        {BOARD_COLUMNS.map((column) => {
          return (
            <article key={column.title} className={styles.HomePage_col}>
              <div className={styles.HomePage_colHeader}>
                <div className={styles.HomePage_titleRow} data-category={column.category}>
                  <h2 className={styles.HomePage_title} data-category={column.category}>
                    {column.title}
                  </h2>
                </div>

                <span className={styles.HomePage_colCount}>{column.count}</span>
              </div>
              <Separator className={styles.HomePage_separator} />

              <ScrollArea className={styles.HomePage_task}>
                <div className={styles.HomePage_taskList}>
                  {column.tasks.map((task) => (
                    <article key={task.id} className={styles.HomePage_taskCard}>
                      <h3 className={styles.HomePage_taskTitle}>{task.title}</h3>
                      <p className={styles.HomePage_taskDesc}>{task.description}</p>

                      <div className={styles.HomePage_taskFooter}>
                        <span className={styles.HomePage_taskProj}>{task.project}</span>
                        <span className={styles.HomePage_taskExpDate}>{task.dueDate}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </ScrollArea>
            </article>
          );
        })}
      </section>
    </main>
  );
}
