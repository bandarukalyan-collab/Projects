"""Oracle database configuration for multi-database queries"""


class DatabaseConfig:
    """Oracle database configuration"""

    # Multiple database configurations
    DATABASES = {
        'EFDRP': {
            'tns_alias': 'EFDRP_TLS',
            'tns_string': """(DESCRIPTION=
     (ADDRESS= (PROTOCOL=TCPS) (HOST=efdrppr-cname.us.dell.com) (PORT=1523))
     (ADDRESS= (PROTOCOL=TCPS) (HOST=efdrpdr-cname.us.dell.com) (PORT=1523))
     (CONNECT_DATA=
       (SERVER=dedicated)
       (SERVICE_NAME=efdrp.prd.emea.dell.com)
     )(SECURITY=(SSL_SERVER_CERT_DN="CN=efdrp.prd.emea.dell.com,O=Dell Technologies Inc.,L=Round Rock,ST=Texas,C=US")))"""
        },
        'FDRP': {
            'tns_alias': 'FDRP_TLS',
            'tns_string': """(DESCRIPTION=
 (ADDRESS= (PROTOCOL=TCPS) (HOST=fdsppr-cname.us.dell.com) (PORT=1523))
 (ADDRESS= (PROTOCOL=TCPS) (HOST=fdspdr-cname.us.dell.com) (PORT=1523))
 (CONNECT_DATA=
   (SERVER=dedicated)
   (SERVICE_NAME=FDRP_OUTBOUND_SVCS.prd.amer.dell.com)
 )(SECURITY=(SSL_SERVER_CERT_DN="CN=fdrp.prd.amer.dell.com, O=Dell Technologies Inc.,L=Round Rock,ST=Texas,C=US")))"""
        },
        'PPIDP': {
            'tns_alias': 'PPIDP.WORLD',
            'tns_string': """(DESCRIPTION=(RETRY_COUNT=3)(RETRY_DELAY=1)(TRANSPORT_CONNECT_TIMEOUT=1sec)(ADDRESS=(PROTOCOL=TCPS)(HOST=ppidprdb-cname.us.dell.com)(PORT=1523))(ADDRESS=(PROTOCOL=TCPS)(HOST=ppiddrdb-cname.us.dell.com)(PORT=1523))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=ppidp_rw.prd.amer.dell.com))(SECURITY=(SSL_SERVER_CERT_DN="CN=ppidp.prd.amer.dell.com,O=Dell Technologies Inc.,L=Round Rock,ST=Texas,C=US")))"""
        },
        # 'LDRP': {
        #     'tns_alias': 'LDRP',
        #     'tns_string': """(DESCRIPTION=(RETRY_COUNT=3)(RETRY_DELAY=1)(TRANSPORT_CONNECT_TIMEOUT=3 sec)(ADDRESS=(PROTOCOL=TCPS)(HOST=ldrpr4dbscn.amer.dell.com)(PORT=1523))(ADDRESS=(PROTOCOL=TCPS)(HOST=ldrppr4dbscn.amer.dell.com)(PORT=1523))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=ldrp_rw_oud.prd.amer.dell.com)(FAILOVER_MODE=(TYPE=SELECT)(METHOD=BASIC)(RETRIES=5)(DELAY=3)))(SECURITY=(SSL_SERVER_CERT_DN="CN=ldrprxdbscn.us.dell.com,O=Dell Technologies Inc.,L=Round Rock,ST=Texas,C=US")))"""
        # }
    }
