import IRepoAdapter, { IRepo } from './adapters/base';
import { ILogger } from './logger';
import { IMigrationSpec } from './util/migration-spec';

export interface IShepherdInfo {
  workingDirectory: string;
}

export interface IMigrationInfo {
  spec: IMigrationSpec;
  migrationDirectory: string;
  workingDirectory: string;
  repos: IRepo[] | null;
  upstreamOwner: string;
  selectedRepos?: IRepo[];
}

export interface IMigrationContext {
  shepherd: IShepherdInfo;
  migration: IMigrationInfo;
  adapter: IRepoAdapter;
  logger: ILogger;
}

export enum state {
  open,
  closed,
}

export enum state_reason {
  completed,
  not_planned,
  reopened,
  null,
}
