import {ENDPOINTS} from '../../../Network/Urls';

export const HELP_DESK_LIST_ACTIONS: any = {
  myTickets: {
    title: 'My Tickets',
    endpoint: ENDPOINTS.myTicketList,
    detailEndpoint: ENDPOINTS.helpDeskTicketDetail,
    detailTitle: 'Ticket Detail',
    itemKey: 'ticket',
    detailKey: 'ticket',
    queryParams: {
      team: '',
      technician: '',
      department: '',
      category: '',
      extendedStatus: '',
      status: 'open,new,assigned,reopen',
      sort: 'dateDesc',
      table: 'my',
    },
  },

  watchedTickets: {
    title: 'Watched Tickets',
    endpoint: ENDPOINTS.myTicketList,
    detailEndpoint: ENDPOINTS.helpDeskTicketDetail,
    detailTitle: 'Ticket Detail',
    itemKey: 'ticket',
    detailKey: 'ticket',
    queryParams: {
      team: '',
      technician: '',
      department: '',
      category: '',
      extendedStatus: '',
      status: 'open,new,assigned,reopen',
      sort: 'dateDesc',
      table: 'watched',
    },
  },

  viewTickets: {
    title: 'View Tickets',
    endpoint: ENDPOINTS.myTicketList,
    detailEndpoint: ENDPOINTS.helpDeskTicketDetail,
    detailTitle: 'Ticket Detail',
    itemKey: 'ticket',
    detailKey: 'ticket',
    queryParams: {
      team: '',
      technician: '',
      department: '',
      category: '',
      extendedStatus: '',
      status: 'open,new,assigned,reopen',
      sort: 'dateDesc',
      table: 'all',
    },
  },

  pendingTicketApprovals: {
    title: 'My Pending Approvals',
    endpoint: ENDPOINTS.myApprovals,
    detailEndpoint: ENDPOINTS.helpDeskTicketDetail,
    detailTitle: 'Ticket Detail',
    itemKey: 'approval',
    detailKey: 'ticket',
    queryParams: {
      sort: 'dateDesc',
      table: 'ticket',
      status: 'pending',
      view: 'my',
    },
  },

  watchedChanges: {
    title: 'Watched Changes',
    endpoint: ENDPOINTS.changeList,
    detailEndpoint: ENDPOINTS.helpDeskChangeDetail,
    detailTitle: 'Change Detail',
    itemKey: 'change',
    detailKey: 'change',
    queryParams: {
      sort: 'dateDesc',
      table: 'watched',
    },
  },

  viewChanges: {
    title: 'View Changes',
    endpoint: ENDPOINTS.changeList,
    detailEndpoint: ENDPOINTS.helpDeskChangeDetail,
    detailTitle: 'Change Detail',
    itemKey: 'change',
    detailKey: 'change',
    queryParams: {
      sort: 'dateDesc',
      table: 'all',
    },
  },

  pendingChangeApprovals: {
    title: 'My Pending Approvals',
    endpoint: ENDPOINTS.myApprovals,
    detailEndpoint: ENDPOINTS.helpDeskChangeDetail,
    detailTitle: 'Change Detail',
    itemKey: 'approval',
    detailKey: 'change',
    queryParams: {
      sort: 'dateDesc',
      table: 'change',
      status: 'pending',
      view: 'my',
    },
  },

  watchedProblems: {
    title: 'Watched Problems',
    endpoint: ENDPOINTS.problemList,
    detailEndpoint: ENDPOINTS.helpDeskProblemDetail,
    detailTitle: 'Problem Detail',
    itemKey: 'problem',
    detailKey: 'problem',
    queryParams: {
      sort: 'dateDesc',
      table: 'watched',
    },
  },

  viewProblems: {
    title: 'View Problems',
    endpoint: ENDPOINTS.problemList,
    detailEndpoint: ENDPOINTS.helpDeskProblemDetail,
    detailTitle: 'Problem Detail',
    itemKey: 'problem',
    detailKey: 'problem',
    queryParams: {
      sort: 'dateDesc',
      table: 'all',
    },
  },

  pendingProblemApprovals: {
    title: 'My Pending Approvals',
    endpoint: ENDPOINTS.myApprovals,
    detailEndpoint: ENDPOINTS.helpDeskProblemDetail,
    detailTitle: 'Problem Detail',
    itemKey: 'approval',
    detailKey: 'problem',
    queryParams: {
      sort: 'dateDesc',
      table: 'problem',
      status: 'pending',
      view: 'my',
    },
  },
};
