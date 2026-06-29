export type User = { id:number; name:string; email:string; role:string; avatar?:string|null }
export type Attachment = { id:number; fileName:string; fileUrl:string; fileType:string; fileSize:number; createdAt:string }
export type Comment = { id:number; comment:string; createdAt:string; user:User; attachments:Attachment[] }
export type Reminder = { id:number; remindAt:string; type:string; message?:string|null; sent:boolean }
export type Activity = { id:number; action:string; oldValue?:string|null; newValue?:string|null; createdAt:string; user?:User|null }
export type Ticket = {
  id:number; title:string; description:string; category:string; priority:string; status:string; clientProject?:string|null; assignedToId?:number|null;
  dueAt:string; tags:string; internalNotes?:string|null; createdAt:string; updatedAt:string; completedAt?:string|null; assignedTo?:User|null; createdBy:User;
  attachments:Attachment[]; comments:Comment[]; reminders:Reminder[]; activityLog:Activity[]
}
