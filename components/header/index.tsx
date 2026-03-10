"use client";

import styles from "./styles.module.css";
import { ThemeToggle } from "../ThemeToggle";

export default function Header() {
  return (
    <div className={styles.topbar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M17.5 14v6M14.5 17h6" strokeLinecap="round" />
          </svg>
        </div>
        <span className={styles.logoName}>Taskflow</span>
      </div>
      <ThemeToggle />
    </div>
  );
}
