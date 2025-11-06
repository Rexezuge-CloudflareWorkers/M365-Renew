class SleepUtil {
  public static sleepMs(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static sleep(sec: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
  }
}

export { SleepUtil };
