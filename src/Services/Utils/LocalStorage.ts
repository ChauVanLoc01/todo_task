type Key = "todo";

export const WorkingWithLocalStorage = {
  set(key: Key, value: string) {
    localStorage.setItem(key, value);
  },
  get(key: Key) {
    return localStorage.getItem(key);
  },
  delete(key: Key) {
    localStorage.removeItem(key);
  },
  update(key: Key, value: string) {
    this.delete(key);
    this.set(key, value);
  },
  clearAll() {
    localStorage.clear();
  },
};
