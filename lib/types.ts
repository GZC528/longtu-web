export type Sort="hot"|"new";
export type Photo={id:string;title:string|null;image_path:string;image_url:string;created_at:string;uploader_id:string;like_count:number;rank:number};
export const titleOf=(title:string|null)=>title?.trim()||"无题龙图";
export const dateOf=(value:string)=>new Intl.DateTimeFormat("zh-CN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
export const countOf=(value:number)=>new Intl.NumberFormat("zh-CN").format(value);
