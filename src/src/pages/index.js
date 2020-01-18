import styles from './index.css';

export default function () {
  return (
    <div className={styles.normal}>
      <div className={styles.welcome} />
      <ul className={styles.list}>
        <li>Visit below link to get help, download latest version or pull request.</li>
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/Lukiya/redismanager">https://github.com/Lukiya/redismanager</a>
        </li>
      </ul>
    </div>
  );
}
