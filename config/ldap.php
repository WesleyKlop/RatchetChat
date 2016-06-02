<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/2/16
 * Time: 9:27 PM
 */
return [
    'account_suffix' => getenv("LDAP_ACCOUNT_SUFFIX"),
    'base_dn' => getenv("LDAP_BASE_DN"),
    'domain_controllers' => [
        getenv("LDAP_DC1"),
        getenv("LDAP_DC2")
    ],
    'recursive_groups' => getenv("LDAP_RECURSE_GROUPS"),
    'admin_username' => getenv("LDAP_ADM_USER"),
    'admin_password' => getenv("LDAP_ADM_PASS"),
];