export const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9а-яёқғҳў]+/gi, '-').replace(/^-|-$/g, '').slice(0, 240);
