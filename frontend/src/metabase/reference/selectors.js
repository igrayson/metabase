import { createSelector } from 'reselect';
import i from "icepick";

const referenceSections = {
    guide: { id: "guide", name: "Understanding our data", icon: "all" },
    metrics: { id: "metrics", name: "Metrics", icon: "star" },
    lists: { id: "lists", name: "Lists", icon: "recents" },
    databases: { id: "databases", name: "Databases and tables", icon: "mine" }
};

export const getEntitiesLoading = (state) => i.getIn(state, ['metadata', 'requestState', 'databases']) === "LOADING";

export const getEntitiesError = (state) => i.getIn(state, ['metadata', 'requestState', 'databases', 'error']);

export const getDatabaseId = (state) => state.router.params.databaseId;

const getReferenceSections = (state) => referenceSections;

const getDatabaseSections = (database) => database ? {
    [`databases/${database.id}`]: { id: `databases/${database.id}`, name: "Details", icon: "all", parent: referenceSections.database },
    [`databases/${database.id}/tables`]: { id: `databases/${database.id}/tables`, name: `Tables in ${database.name}`, icon: "star", parent: referenceSections.database }
} : {};

const getSectionByPath = (sections, path) => sections.find(section => section.path === path || section.id === path);

const stripBasepath = (path) => path.slice('/reference/'.length);

export const getSectionId = (state) => state.router.params.section || stripBasepath(state.router.location.pathname);

const getDatabases = (state) => state.metadata.databases;

const getTables = (database) => database && database.tables ?
    database.tables.reduce((tableMap, table) => i.assoc(tableMap, table.id, table), {}) :
    {};

export const getEntities = createSelector(
    [getSectionId, getDatabaseId, getDatabases],
    (sectionId, databaseId, databases) => {
        if (sectionId === `databases/${databaseId}/tables`) {
            return getTables(databases[databaseId]);
        }
        return databases;
    }
);

export const getEntity = createSelector(
    [getSectionId, getDatabases, getDatabaseId],
    (sectionId, databases, databaseId) => {
        // console.log(databases)
        return databases[databaseId];
    }
);

export const getSections = createSelector(
    [getSectionId, getEntity, getReferenceSections],
    (sectionId, entity, referenceSections) => referenceSections[sectionId] ? referenceSections : getDatabaseSections(entity)
);

export const getSection = createSelector(
    [getSectionId, getSections],
    (sectionId, sections) => sections[sectionId] || {}
);

const getEntityRequestStates = (state) => i.getIn(state, ['metadata', 'requestState', 'database']);

export const getEntityLoading = createSelector(
    [getDatabaseId, getEntityRequestStates],
    (databaseId, entityRequestStates) => entityRequestStates[databaseId] === 'LOADING'
)

export const getEntityError = createSelector(
    [getDatabaseId, getEntityRequestStates],
    (databaseId, entityRequestStates) => i.getIn(entityRequestStates, [databaseId, 'error'])
)

export const getBreadcrumbs = (state) => {
    const sectionId = getSectionId(state);
    console.log(sectionId);

    if (referenceSections[sectionId]) {
        return [];
    }

    const databaseName = i.getIn(getEntity(state), ['name']);
    console.log(state);
    return [['Data', '/reference/databases'], databaseName];
};