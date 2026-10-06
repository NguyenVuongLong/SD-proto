export interface TopicGroupItem {
  departmentCode?: string;
  topicName: string;
}

export interface TopicGroup {
  departmentName: string;
  topics: string[];
}

export interface EmployeeLookupItem {
  userName?: string;
  employeeCode?: string;
  employeeName?: string;
}

export function buildTopicFilterGroups(
  topics: TopicGroupItem[],
  departmentNames: Record<string, string>
): TopicGroup[] {
  const grouped = new Map<string, Set<string>>();

  for (const topic of topics) {
    const department = topic.departmentCode ?? '';
    const departmentName = departmentNames[department] ?? (department || 'Khác');
    const names = grouped.get(departmentName) ?? new Set<string>();
    if (topic.topicName) names.add(topic.topicName);
    grouped.set(departmentName, names);
  }

  return Array.from(grouped.entries())
    .map(([departmentName, topicNames]) => ({
      departmentName,
      topics: Array.from(topicNames).sort((left, right) => left.localeCompare(right))
    }))
    .sort((left, right) => left.departmentName.localeCompare(right.departmentName));
}

export function parseVnDate(value: string): Date | null {
  const [day, month, year] = value.split('/').map(Number);
  return day && month && year ? new Date(year, month - 1, day) : null;
}

export function parseVnDateValue(value: string): number {
  return parseVnDate(value)?.getTime() ?? 0;
}

export function formatVnDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function keepLatestPerGroup(values: string[], previous: string[], group: string[]): string[] {
  const selected = values.filter((value) => group.includes(value));
  if (selected.length <= 1) return values;

  const newlyAdded = selected.find((value) => !previous.includes(value));
  const keep = newlyAdded ?? selected[selected.length - 1];
  return values.filter((value) => !group.includes(value) || value === keep);
}

export function createEmployeeLookups(employees: EmployeeLookupItem[]): {
  codes: Record<string, string>;
  names: Record<string, string>;
} {
  const codes: Record<string, string> = {};
  const names: Record<string, string> = {};

  for (const employee of employees) {
    const code = (employee.employeeCode ?? '').trim();
    const name = (employee.employeeName ?? '').trim();
    const userName = (employee.userName ?? '').trim().toLowerCase();
    if (userName) {
      codes[userName] = code;
      names[userName] = name;
    }
    if (code) {
      codes[code.toLowerCase()] = code;
      names[code.toLowerCase()] = name;
    }
  }

  return { codes, names };
}

export function formatEmployeeName(code: string, name: string): string {
  const trimmedCode = code.trim();
  const trimmedName = name.trim();
  if (!trimmedCode && !trimmedName) return 'Bạn';
  if (!trimmedCode) return trimmedName;
  if (!trimmedName) return trimmedCode;
  return `${trimmedCode} - ${trimmedName}`;
}
