"use client";

import styles from "./styles.module.css";
import { ThemeToggle } from "../ThemeToggle";
import Image from "next/image";

export default function Header() {
  return (
    <div className={styles.topbar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Image src="/icon.svg" alt="Taskflow" width={24} height={24} />
        </div>
        <span className={styles.logoName}>Taskflow</span>
      </div>
      <ThemeToggle />
    </div>
  );
}
