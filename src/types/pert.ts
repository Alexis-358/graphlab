export interface PertTask {
  id: string
  name: string
  duration: number
  predecessors: string[]  // ids des tâches prédécesseurs
}

export interface PertTaskComputed extends PertTask {
  earlyStart: number   // date au plus tôt
  earlyEnd: number     // fin au plus tôt
  lateStart: number    // date au plus tard
  lateEnd: number      // fin au plus tard
  totalFloat: number   // marge totale
  isCritical: boolean  // sur le chemin critique
}

export interface PertResult {
  tasks: PertTaskComputed[]
  projectDuration: number
  criticalPath: string[]  // ids des tâches critiques dans l'ordre
}